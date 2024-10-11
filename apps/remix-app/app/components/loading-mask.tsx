import { useNavigation } from "@remix-run/react";
import { RocketIcon } from "lucide-react";

export default function LoadingMask() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="flex items-center justify-center rounded-full bg-white p-10 shadow-lg">
        <RocketIcon className="h-10 w-10 animate-pulse text-primary" />
      </div>
    </div>
  );
}
