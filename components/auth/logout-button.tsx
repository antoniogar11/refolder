import { logoutAction } from "@/app/auth/actions";
import { Button, type ButtonProps } from "@/components/ui/button";

type LogoutButtonProps = {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
};

export function LogoutButton({ variant = "outline", size, className }: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant={variant} size={size} className={className}>
        Cerrar sesión
      </Button>
    </form>
  );
}

