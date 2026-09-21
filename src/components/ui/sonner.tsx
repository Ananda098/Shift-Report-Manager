import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** shadcn's Sonner toaster, themed with the app's dark tokens.
    Position is left at Sonner's default: bottom-right of the viewport. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      // Clears the NavRail bottom bar (56px) and keeps the toast inside the
      // viewport, which Sonner's default mobile offset does not.
      mobileOffset={{ bottom: '72px', left: '16px', right: '16px' }}
      style={
        {
          // Sonner paints toasts from these vars; point them at the app's palette.
          '--normal-bg': '#23212A', // raised
          '--normal-text': '#E9E6EC', // txt
          '--normal-border': '#302E38' // line
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:rounded-xl group-[.toaster]:font-sans group-[.toaster]:text-body group-[.toaster]:shadow-xl',
          description: 'group-[.toast]:text-muted',
          actionButton: 'group-[.toast]:bg-teal group-[.toast]:text-teal-ink',
          cancelButton: 'group-[.toast]:bg-card group-[.toast]:text-muted',
          icon: 'group-[.toast]:text-teal'
        }
      }}
      {...props}
    />
  );
};

export { Toaster };
