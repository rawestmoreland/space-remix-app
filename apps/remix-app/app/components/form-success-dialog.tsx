import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export function FormSuccessDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Success! Your email address has been received.
          </DialogTitle>
          <DialogDescription>
            We&apos;ve sent a confirmation email to the address you provided.
            Please check your inbox and follow the instructions to verify your
            email address.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Ok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
