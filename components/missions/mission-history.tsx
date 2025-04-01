import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle } from "lucide-react"

interface UserMission {
  id: string
  user_id: string
  mission_id: string
  mission_title: string
  reward: number
  status: string
  created_at: string
}

export function MissionHistory({ missions }: { missions: UserMission[] }) {
  // If no missions, show a message
  if (missions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mission History</CardTitle>
          <CardDescription>Your completed missions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No missions completed yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mission History</CardTitle>
        <CardDescription>Your completed missions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Mission</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missions.map((mission) => {
              const formattedDate = new Date(mission.created_at).toLocaleDateString()
              const formattedReward = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(mission.reward)

              return (
                <TableRow key={mission.id}>
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell>{mission.mission_title}</TableCell>
                  <TableCell className="text-green-500">+{formattedReward}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      {mission.status}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

