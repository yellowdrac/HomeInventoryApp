import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown } from '@features/Assistant/components/Markdown';

describe('Markdown', () => {
  it('renders an unordered list', () => {
    render(<Markdown content={'You have:\n\n- Coffee\n- Tea'} />);

    const items = screen.getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['Coffee', 'Tea']);
  });

  it('renders bold and inline code', () => {
    const { container } = render(
      <Markdown content={'Use **batteries** in the `Garage`.'} />,
    );

    expect(container.querySelector('strong')?.textContent).toBe('batteries');
    expect(container.querySelector('code')?.textContent).toBe('Garage');
  });

  it('does not inject raw HTML (XSS-safe)', () => {
    const { container } = render(
      <Markdown content={'<img src=x onerror="alert(1)">'} />,
    );

    // The raw HTML is rendered as text, not as an element.
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror="alert(1)">');
  });

  it('drops unsafe link schemes but keeps the text', () => {
    const { container } = render(
      <Markdown content={'[click](javascript:alert(1))'} />,
    );

    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('click');
  });
});
