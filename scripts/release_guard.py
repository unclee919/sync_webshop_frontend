#!/usr/bin/env python3
"""Release safety checks for Sync Webshop frontend deployments."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

REQUIRED_SOURCE_PATHS = [
    "src/context/ContentContext.jsx",
    "src/pages/Landing.jsx",
    "src/pages/ProductList.jsx",
    "src/pages/ProductDetail.jsx",
    "src/pages/Cart.jsx",
    "src/pages/Checkout.jsx",
    "src/pages/Dashboard.jsx",
    "src/pages/Features.jsx",
    "src/pages/AboutPage.jsx",
    "src/pages/PolicyPage.jsx",
    "src/pages/ArticlesPage.jsx",
    "src/pages/ArticleDetailPage.jsx",
    "src/pages/OrderTracking.jsx",
    "src/pages/Wishlist.jsx",
    "src/pages/QaPage.jsx",
    "src/pages/DynamicPages.jsx",
    "src/components/Header.jsx",
    "src/components/Footer.jsx",
    "src/components/QuoteRequestModal.jsx",
    "src/components/LoginModal.jsx",
    "src/components/StripePaymentForm.jsx",
    "src/components/CompleteTheLook.jsx",
    "src/components/VisualSearch.jsx",
    "src/components/TrackingMap.jsx",
    "src/components/AiChatWidget.jsx",
    "src/components/FitGuide.jsx",
    "src/components/MiniCart.jsx",
    "src/components/StyleQuiz.jsx",
    "src/components/QuickView.jsx",
    "src/components/ComparisonTray.jsx",
    "src/components/UnifiedFloatingActions.jsx",
    "src/components/ImmersiveProductViewer.jsx",
    "src/components/SpatialProductControls.jsx",
    "src/components/ProductStageSwitcher.jsx",
    "src/components/MobileQuickActions.jsx",
    "src/components/ExpressCheckoutBar.jsx",
    "src/components/GiftOptions.jsx",
    "src/components/SocialProof.jsx",
    "src/components/LuxuryLiveSocial.jsx",
    "src/components/EliteStories.jsx",
    "src/pages/CollectionStoryteller.jsx",
    "src/components/EnterpriseExperience.jsx",
    "src/components/AutonomousEcosystem.jsx",
    "src/components/MasterTierHub.jsx",
    "src/components/MasterTierHotspots.jsx",
    "src/components/MaterialStudio.jsx",
    "src/components/VoiceSearch.jsx",
    "src/components/VisualFilterChips.jsx",
    "src/components/PwaController.jsx",
]
REQUIRED_CONTRACT_KEYS = [
    "checkout_title_en",
    "account_title_en",
    "quote_title_en",
    "stripe_secure_hint_en",
]
EXPECTED_ROUTE_MARKERS = [
    "/products",
    "/cart",
    "/checkout",
    "/dashboard",
]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def git_revision(source: Path) -> str:
    return subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip()


def source_guard(source: Path) -> dict:
    missing = [path for path in REQUIRED_SOURCE_PATHS if not (source / path).is_file()]
    if missing:
        raise SystemExit("source_guard_failed missing=" + ",".join(missing))
    context = (source / "src/context/ContentContext.jsx").read_text()
    missing_keys = [key for key in REQUIRED_CONTRACT_KEYS if key not in context]
    if missing_keys:
        raise SystemExit("source_guard_failed missing_contract_keys=" + ",".join(missing_keys))
    status = subprocess.check_output(["git", "-C", str(source), "status", "--porcelain"], text=True)
    if status.strip():
        raise SystemExit("source_guard_failed dirty_worktree=true")
    return {"git_revision": git_revision(source), "required_source_paths": len(REQUIRED_SOURCE_PATHS), "contract_keys": len(REQUIRED_CONTRACT_KEYS)}


def build_guard(dist: Path) -> dict:
    if not (dist / "index.html").is_file():
        raise SystemExit("build_guard_failed missing_index=true")
    files = sorted(path for path in dist.rglob("*") if path.is_file())
    if len(files) < 70:
        raise SystemExit(f"build_guard_failed asset_count={len(files)} expected_at_least=70")
    index = (dist / "index.html").read_text()
    asset_refs = sorted(set(re.findall(r'(?:src|href)="([^"]+\.(?:js|css)(?:\?[^" ]*)?)"', index)))
    missing_assets = [ref for ref in asset_refs if not (dist / ref.lstrip("/")).is_file()]
    if missing_assets:
        raise SystemExit("build_guard_failed missing_assets=" + ",".join(missing_assets))
    bundle_text = "\n".join(path.read_text(errors="ignore") for path in files if path.suffix == ".js")
    missing_keys = [key for key in REQUIRED_CONTRACT_KEYS if key not in bundle_text]
    if missing_keys:
        raise SystemExit("build_guard_failed missing_bundle_keys=" + ",".join(missing_keys))
    manifest = {"asset_count": len(files), "asset_refs": asset_refs, "dist_sha256": hashlib.sha256("".join(sha256_file(path) for path in files).encode()).hexdigest()}
    return manifest


def remote_guard(base_url: str) -> dict:
    base_url = base_url.rstrip("/") + "/"
    routes = []
    for route in ["/", *EXPECTED_ROUTE_MARKERS]:
        response = urlopen(Request(urljoin(base_url, route), headers={"Cache-Control": "no-cache"}), timeout=20)
        body = response.read()
        if response.status != 200 or b'id="root"' not in body:
            raise SystemExit(f"remote_guard_failed route={route} status={response.status}")
        routes.append({"route": route, "status": response.status, "bytes": len(body)})
    api_response = urlopen(Request(urljoin(base_url, "/api/method/sync_webshop.api.content.get_content"), headers={"Cache-Control": "no-cache"}), timeout=30)
    payload = json.loads(api_response.read().decode())
    data = payload.get("message", payload)
    copy = data.get("copy", {})
    missing = [key for key in REQUIRED_CONTRACT_KEYS if key not in copy.get("ui", {}) and key not in copy.get("feature", {})]
    if missing:
        raise SystemExit("remote_guard_failed missing_api_keys=" + ",".join(missing))
    return {"routes": routes, "api_status": api_response.status, "copy_groups": sorted(copy), "api_contract_keys": len(REQUIRED_CONTRACT_KEYS)}


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    source_parser = subparsers.add_parser("source")
    source_parser.add_argument("source", type=Path)
    build_parser = subparsers.add_parser("build")
    build_parser.add_argument("dist", type=Path)
    remote_parser = subparsers.add_parser("remote")
    remote_parser.add_argument("base_url")
    args = parser.parse_args()
    if args.command == "source":
        result = source_guard(args.source)
    elif args.command == "build":
        result = build_guard(args.dist)
    else:
        result = remote_guard(args.base_url)
    print(json.dumps({"guard": args.command, "result": result}, indent=2))


if __name__ == "__main__":
    main()
