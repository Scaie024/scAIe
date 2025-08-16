declare module '@/components/ui/card' {
  import { FC, HTMLAttributes, ReactNode } from 'react';

  interface CardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
  }

  interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
  }

  interface CardTitleProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
  }

  interface CardDescriptionProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
  }

  interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
  }

  export const Card: FC<CardProps>;
  export const CardHeader: FC<CardHeaderProps>;
  export const CardTitle: FC<CardTitleProps>;
  export const CardDescription: FC<CardDescriptionProps>;
  export const CardContent: FC<CardContentProps>;
}
