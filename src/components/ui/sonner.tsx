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
          // One compact line: tighter than Sonner's 16px box, a step down the
          // type scale, and a title that ellipsises rather than wrapping.
          // Sonner injects its own stylesheet after this app's, and sets
          // padding/radius/font-size at a specificity these utilities can't
          // reach, so the ones it also declares are marked important. 12px is
          // below the app's type scale on purpose — the toast is chrome, and
          // `label` (13px) is what Sonner was already rendering.
          toast: 'group toast group-[.toaster]:items-center group-[.toaster]:!gap-2 group-[.toaster]:!rounded-xl group-[.toaster]:!px-3 group-[.toaster]:!py-2 group-[.toaster]:font-sans group-[.toaster]:!text-[12px] group-[.toaster]:!leading-[1.4] group-[.toaster]:shadow-xl',
          title: 'group-[.toast]:truncate',
          description: 'group-[.toast]:truncate group-[.toast]:text-muted',
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
