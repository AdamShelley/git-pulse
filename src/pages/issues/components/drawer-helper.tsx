import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface DrawerHelperProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  submitCallback?: () => void;
}

const DrawerHelper = ({
  trigger,
  title,
  description,
  children,
  footer,
  submitCallback,
}: DrawerHelperProps) => {
  return (
    <Drawer>
      <DrawerTrigger>{trigger}</DrawerTrigger>

      <DrawerContent className="dark text-white font-inter">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        {children}

        <DrawerFooter>
          {footer || (
            <>
              <Button
                onClick={
                  submitCallback ||
                  (() => console.log("Submit callback not provided"))
                }
              >
                Submit
              </Button>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerHelper;
