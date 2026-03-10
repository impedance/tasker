import * as React from "react"
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTrigger } from "./dialog"
import { cn } from "../utils"

const Drawer = Dialog
const DrawerTrigger = DialogTrigger

const DrawerContent = React.forwardRef<
    React.ElementRef<typeof DialogContent>,
    React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogContent
            ref={ref}
            className={cn(
                "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
                className
            )}
            {...props}
        >
            {children}
        </DialogContent>
    </DialogPortal>
))
DrawerContent.displayName = "DrawerContent"

export { Drawer, DrawerTrigger, DrawerContent }
