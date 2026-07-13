import React from 'react';
import { MoreHorizontal, FileText, Play, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockInterviews = [
  { id: '1', role: 'Senior Frontend Engineer', date: 'Oct 24, 2026', score: 92, status: 'Completed' },
  { id: '2', role: 'System Design', date: 'Oct 20, 2026', score: 85, status: 'Completed' },
  { id: '3', role: 'Behavioral', date: 'Oct 18, 2026', score: 95, status: 'Completed' },
  { id: '4', role: 'React Developer', date: 'Oct 15, 2026', score: null, status: 'In Progress' },
];

export const RecentInterviewsTable: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <h2 className="text-lg font-bold text-slate-900">Recent Interviews</h2>
        <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
          View All
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-500">Role</TableHead>
              <TableHead className="font-semibold text-slate-500">Date</TableHead>
              <TableHead className="font-semibold text-slate-500 text-center">Score</TableHead>
              <TableHead className="font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInterviews.map((interview) => (
              <TableRow 
                key={interview.id} 
                className="group border-slate-100 hover:bg-blue-50/50 transition-colors"
              >
                <TableCell className="font-semibold text-slate-700">
                  {interview.role}
                </TableCell>
                <TableCell className="text-slate-500 text-sm font-medium">
                  {interview.date}
                </TableCell>
                <TableCell className="text-center">
                  {interview.score ? (
                    <span className={`font-bold ${interview.score >= 90 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {interview.score}%
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={interview.status === 'Completed' ? 'default' : 'secondary'}
                    className={interview.status === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/50' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/50'}
                  >
                    {interview.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-slate-100 bg-white">
                      <DropdownMenuLabel className="text-slate-900 font-semibold">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-100" />
                      <DropdownMenuItem className="cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus:bg-slate-50">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>View Report</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus:bg-slate-50">
                        <Play className="mr-2 h-4 w-4" />
                        <span>Retry</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-100" />
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
