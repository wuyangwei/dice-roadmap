type Props = {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function DicePicker({ label, value, onChange, disabled }: Props) {
  return (
    <section className="dice-picker">
      <div className="section-title">{label}</div>
      <div className="dice-grid">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <button
            className={item === value ? 'dice-button active' : 'dice-button'}
            disabled={disabled}
            key={item}
            onClick={() => onChange(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
