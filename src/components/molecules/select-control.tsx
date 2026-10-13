import { Select } from '@/components/atoms/select';

export interface SelectOption { value: string | number; label: string; disabled?: boolean }
export function SelectControl({ id, label, value, options, onChange }: {
  id: string; label: string; value: string | number; options: SelectOption[]; onChange: (value: string) => void;
}) {
  return <><label htmlFor={id}>{label}</label><Select id={id} value={value} onChange={event => onChange(event.target.value)}>
    {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
  </Select></>;
}
