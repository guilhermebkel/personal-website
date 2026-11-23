import type { ComponentProps } from "react";
import { Button as UiButton } from "@components/ui/button.tsx";
import { BUTTON_VARIANT_TO_CLASS, type ButtonVariant } from "@components/ButtonClasses.ts";
import { ClassNameUtil } from "@/Utils/ClassNameUtil.ts";

type ButtonProps = Omit<ComponentProps<typeof UiButton>, "variant" | "size"> & { variant?: ButtonVariant };

export const Button = ({ className, variant = "primary", ...props }: ButtonProps) => {
  // Why: null turns off the library's own variant and size, so the app's variants (our tokens) are the only look.
  const variantClass = BUTTON_VARIANT_TO_CLASS[variant];
  const classes = ClassNameUtil.merge(variantClass, className);
  return <UiButton variant={null} size={null} className={classes} {...props} />;
};
