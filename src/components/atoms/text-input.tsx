import type { ComponentProps } from 'react';

export function TextInput(props: ComponentProps<'input'>) {
  return <input {...props} />;
}
