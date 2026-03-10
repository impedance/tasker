import * as React from "react"
import { Button, ButtonProps } from "./button"

export interface IconButtonProps extends ButtonProps {
    icon: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, className, ...props }, ref) => {
        return (
            <Button
                variant="ghost"
                size="icon"
                className={className}
                ref={ref}
                {...props}
            >
                {icon}
            </Button>
        )
    }
)
IconButton.displayName = "IconButton"

export { IconButton }
