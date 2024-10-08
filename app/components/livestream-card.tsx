import { Card, CardContent } from "./ui/card";
import { IStarshipLiveStream } from "~/services/starshipDashboardService";

export function LivestreamCard({
  livestream,
}: {
  livestream: IStarshipLiveStream;
}) {
  return (
    <a
      href={livestream.url}
      rel="noopener noreferrer"
      target="_blank"
      className="group h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <img
            src={livestream.image ?? "/placeholder-rocket.jpg"}
            alt={livestream.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="flex-grow p-4">
          <h3 className="mb-2 line-clamp-2 text-xl font-bold">
            {livestream.title}
          </h3>
          <p className="line-clamp-3 text-sm">{livestream.description}</p>
        </CardContent>
      </Card>
    </a>
  );
}
