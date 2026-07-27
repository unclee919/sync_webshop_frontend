/**
 * RoastStamp - the page's signature device.
 *
 * Coffee bags are physically stamped with roast date, origin, and grade -
 * a circular ink mark is one of the most recognizable artifacts of coffee
 * packaging. This component borrows that exact shape and repeats it as the
 * one consistent visual signature across the landing page (hero corner,
 * category cards, testimonial quotes), rather than a generic numbered
 * badge or icon.
 *
 * It's deliberately generic underneath (just a circular label + optional
 * small text) so a non-coffee deployment of this same storefront could
 * relabel it ("New", "Bestseller", "Certified") without changing the shape.
 */
export default function RoastStamp({ label, size = 64, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="var(--color-background)"
        strokeWidth="2"
      />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="var(--color-background)"
        strokeWidth="1"
        strokeDasharray="2 4"
      />
      {label && (
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-heading)"
          fontWeight="700"
          letterSpacing="1"
          fill="var(--color-background)"
        >
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  )
}
