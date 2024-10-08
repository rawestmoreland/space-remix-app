import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { IStarshipVehicle } from "~/services/starshipDashboardService";

export function VehicleCard({ vehicle }: { vehicle: IStarshipVehicle }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <Badge
          className="absolute left-2 top-2 rounded-full"
          variant={
            vehicle.status.name === "scrapped" ||
            vehicle.status.name === "destroyed" ||
            vehicle.status.name === "lost"
              ? "destructive"
              : "secondary"
          }
        >
          {vehicle.status.name}
        </Badge>
        <img
          src={vehicle.image.image_url ?? "/placeholder-rocket.jpg"}
          alt={vehicle.serial_number}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="flex-grow p-4">
        <h3 className="mb-2 line-clamp-2 text-xl font-bold">
          {vehicle.serial_number}
        </h3>
        <p className="line-clamp-3 text-sm">{vehicle.details}</p>
      </CardContent>
      <CardFooter className="z-10 flex gap-2 bg-background pt-4">
        <Badge variant="default">{vehicle.launcher_config.full_name}</Badge>
      </CardFooter>
    </Card>
  );
}
