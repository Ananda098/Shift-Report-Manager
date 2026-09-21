import React from 'react';

interface EmptySectionProps {
  text: string;
}

export function EmptySection({ text }: EmptySectionProps) {
  return <p className="text-body text-faint">{text}</p>;
}