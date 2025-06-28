import * as React from 'react';
import { ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      className={cn('inline-flex items-center gap-1 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn('flex flex-wrap items-center gap-1.5', className)} {...props} />
  )
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('inline-flex items-center gap-1.5', className)} {...props} />
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      className={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ children, className, ...props }, ref) => (
  <span
    ref={ref}
    role="presentation"
    aria-hidden="true"
    className={cn('text-muted-foreground', className)}
    {...props}
  >
    {children || <ChevronRightIcon className="h-4 w-4" />}
  </span>
));
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="h-4 w-4" />
      <span className="sr-only">更多</span>
    </span>
  )
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
