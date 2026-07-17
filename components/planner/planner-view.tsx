"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { PlusIcon, ExternalLinkIcon, CopyIcon, TrashIcon, EditIcon, MessageCircle, Briefcase, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createSocialPost, deleteSocialPost } from "@/actions/social-posts";
import dynamic from "next/dynamic";

const PlannerDialog = dynamic(() => import("./planner-dialog").then(m => m.PlannerDialog), { ssr: false });

export function PlannerView() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: posts = [], refetch, isLoading } = useQuery({
    queryKey: ['social_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('social-posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'social_posts' },
        () => { refetch(); }
      )
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [supabase, refetch]);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter === "all" || post.platform === platformFilter;
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <MessageCircle className="size-4" />;
      case 'linkedin': return <Briefcase className="size-4" />;
      case 'reddit': return <SendIcon className="size-4" />; // Using SendIcon for Reddit approximation
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100/80">Draft</Badge>;
      case 'scheduled': return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100/80">Scheduled</Badge>;
      case 'published': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100/80">Published</Badge>;
      case 'archived': return <Badge variant="secondary" className="bg-zinc-200 text-zinc-500 hover:bg-zinc-200/80">Archived</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openPlatformLink = (platform: string) => {
    let url = "";
    if (platform === "twitter") url = "https://x.com/compose/post";
    else if (platform === "linkedin") url = "https://www.linkedin.com/feed/";
    else if (platform === "reddit") url = "https://www.reddit.com/submit";
    
    if (url) window.open(url, "_blank");
  };

  const handleDuplicate = async (post: any) => {
    try {
      await createSocialPost({
        title: `${post.title} (Copy)`,
        content: post.content,
        platform: post.platform,
        status: "draft",
        scheduled_at: null,
        notes: post.notes,
      });
      toast.success("Post duplicated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to duplicate post");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteSocialPost(id);
        toast.success("Post deleted");
      } catch (e: any) {
        toast.error(e.message || "Failed to delete post");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-[22px] border border-zinc-200">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search posts..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full sm:w-64 bg-zinc-50 border-zinc-200"
          />
          <Select value={platformFilter} onValueChange={(val) => setPlatformFilter(val || "all")}>
            <SelectTrigger className="w-[140px] bg-zinc-50 border-zinc-200">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">X (Twitter)</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="reddit">Reddit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-[140px] bg-zinc-50 border-zinc-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => { setSelectedPost(null); setIsDialogOpen(true); }}>
          <PlusIcon className="mr-2 size-4" />
          New Post
        </Button>
      </div>

      <div className="rounded-md border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">Loading posts...</TableCell>
              </TableRow>
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">No posts found.</TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                      {getPlatformIcon(post.platform)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedPost(post); setIsDialogOpen(true); }} title="Edit">
                        <EditIcon className="size-4 text-zinc-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDuplicate(post)} title="Duplicate">
                        <CopyIcon className="size-4 text-zinc-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openPlatformLink(post.platform)} title="Open Platform">
                        <ExternalLinkIcon className="size-4 text-zinc-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} title="Delete" className="hover:text-red-600">
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PlannerDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        post={selectedPost}
      />
    </div>
  );
}
