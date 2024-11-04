import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

type LeaderboardEntry = {
  username: string;
  score: number;
};

type LeaderboardProps = {
  leaderboard: LeaderboardEntry[];
  onBack: () => void;
};

export function LeaderboardComponent({ leaderboard, onBack }: LeaderboardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <Table>
        <TableHeader>
          <TableRow key="header">
            <TableHead>Rank</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((entry, index) => (
            <TableRow key={entry.username}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{entry.username}</TableCell>
              <TableCell>{entry.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={onBack} className="mt-4">Back</Button>
    </div>
  );
}