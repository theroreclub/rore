"use client";

const sizing = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL", "5XL"];
const swatches: Record<string, string> = {
  white: "#ffffff", black: "#171717", "off white": "#eee7d5", "navy blue": "#202c46",
  maroon: "#702536", red: "#b02e36", grey: "#858585", gray: "#858585",
};

export function splitVariants(labels: string[]) {
  return labels.map(label => {
    const pair = /^(.+)\s+(?:-|\/)\s+(.+)$/.exec(label);
    return { label, colour: pair?.[1].trim() ?? "", size: pair?.[2].trim() ?? label };
  });
}

function Choices({ title, values, selected, onChange, disabled = [], colours = false }: {
  title: string; values: string[]; selected: string; onChange: (value: string) => void;
  disabled?: string[]; colours?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map(value => (
          <label key={value} className="variant-choice">
            <input className="sr-only" type="radio" name={title} value={value}
              checked={selected === value} disabled={disabled.includes(value)} onChange={() => onChange(value)} />
            <span>
              {colours && swatches[value.toLowerCase()] && <i aria-hidden="true" style={{ backgroundColor: swatches[value.toLowerCase()] }} />}
              {value}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function VariantPicker({ options, colour, size, select }: {
  options: ReturnType<typeof splitVariants>; colour: string; size: string;
  select: (colour: string, size: string) => void;
}) {
  const separated = options.every(option => option.colour);
  const sizes = Array.from(new Set(options.map(option => separated ? option.size : option.label)));
  if (sizes.every(value => sizing.includes(value.toUpperCase()))) {
    sizes.sort((a, b) => sizing.indexOf(a.toUpperCase()) - sizing.indexOf(b.toUpperCase()));
  }
  const available = options.filter(option => option.colour === colour).map(option => option.size);
  function chooseColour(value: string) {
    const choices = options.filter(option => option.colour === value);
    const nextSize = choices.some(option => option.size === size) ? size : choices.length === 1 ? choices[0].size : "";
    select(value, nextSize);
  }
  return (
    <div className="space-y-4 border-t pt-5">
      {separated && <Choices title="Colour" values={Array.from(new Set(options.map(option => option.colour)))}
        selected={colour} onChange={chooseColour} colours />}
      <Choices title={separated || sizes.every(value => sizing.includes(value.toUpperCase()) || /^(one size|standard|classic)$/i.test(value)) ? "Size" : "Option"}
        values={sizes} selected={size} onChange={value => select(colour, value)}
        disabled={separated ? sizes.filter(value => !available.includes(value)) : []} />
    </div>
  );
}
