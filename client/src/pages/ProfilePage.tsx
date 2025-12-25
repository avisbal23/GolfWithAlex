import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Profile, Scorecard } from '@shared/schema';
import type { User } from '@shared/models/auth';

interface ProfileData {
  profile: Profile | null;
  user: User;
}

export function ProfilePage({ onBack }: { onBack: () => void }) {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  const { data: scorecards = [], isLoading: scorecardsLoading } = useQuery<Scorecard[]>({
    queryKey: ['/api/scorecards'],
    enabled: !!user,
  });

  const [form, setForm] = useState({
    displayName: '',
    aboutMe: '',
    location: '',
    favoriteCourse: '',
    favoriteClub: '',
    age: '',
    isPublic: false,
  });

  useEffect(() => {
    if (data?.profile) {
      setForm({
        displayName: data.profile.displayName || '',
        aboutMe: data.profile.aboutMe || '',
        location: data.profile.location || '',
        favoriteCourse: data.profile.favoriteCourse || '',
        favoriteClub: data.profile.favoriteClub || '',
        age: data.profile.age?.toString() || '',
        isPublic: data.profile.isPublic,
      });
    } else if (data?.user) {
      setForm(prev => ({
        ...prev,
        displayName: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
      }));
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return apiRequest('PATCH', '/api/profile', profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({ title: 'Profile saved' });
    },
    onError: () => {
      toast({ title: 'Failed to save profile', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/scorecards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scorecards'] });
      toast({ title: 'Scorecard deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete scorecard', variant: 'destructive' });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      displayName: form.displayName || null,
      aboutMe: form.aboutMe || null,
      location: form.location || null,
      favoriteCourse: form.favoriteCourse || null,
      favoriteClub: form.favoriteClub || null,
      age: form.age ? parseInt(form.age) : null,
      isPublic: form.isPublic,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <h2 className="text-xl font-semibold">Sign in to view your profile</h2>
        <Button onClick={() => window.location.href = '/api/login'} data-testid="button-login">
          Sign In
        </Button>
        <Button variant="ghost" onClick={onBack} data-testid="button-back">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <header className="h-14 px-4 flex items-center justify-between gap-2 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            data-testid="button-save-profile"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => logout()} data-testid="button-logout">
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            {data?.user?.profileImageUrl && (
              <img
                src={data.user.profileImageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full"
                data-testid="img-profile"
              />
            )}
            <div>
              <p className="font-medium" data-testid="text-email">{data?.user?.email}</p>
              <p className="text-sm text-muted-foreground">
                Joined {data?.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : 'recently'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Your name"
                data-testid="input-display-name"
              />
            </div>

            <div>
              <Label htmlFor="aboutMe">About Me</Label>
              <Textarea
                id="aboutMe"
                value={form.aboutMe}
                onChange={(e) => setForm(prev => ({ ...prev, aboutMe: e.target.value }))}
                placeholder="Tell others about yourself..."
                rows={3}
                data-testid="input-about-me"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Where are you from?"
                data-testid="input-location"
              />
            </div>

            <div>
              <Label htmlFor="favoriteCourse">Favorite Course</Label>
              <Input
                id="favoriteCourse"
                value={form.favoriteCourse}
                onChange={(e) => setForm(prev => ({ ...prev, favoriteCourse: e.target.value }))}
                placeholder="Your favorite golf course"
                data-testid="input-favorite-course"
              />
            </div>

            <div>
              <Label htmlFor="favoriteClub">Favorite Club</Label>
              <Input
                id="favoriteClub"
                value={form.favoriteClub}
                onChange={(e) => setForm(prev => ({ ...prev, favoriteClub: e.target.value }))}
                placeholder="Your go-to club"
                data-testid="input-favorite-club"
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={form.age}
                onChange={(e) => setForm(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Your age"
                data-testid="input-age"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="isPublic" className="font-medium">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  {form.isPublic ? 'Anyone can see your profile and scorecards' : 'Only you can see your data'}
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={form.isPublic}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPublic: checked }))}
                data-testid="switch-is-public"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3" data-testid="text-saved-rounds-title">Saved Rounds ({scorecards.length})</h3>
          {scorecardsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : scorecards.length === 0 ? (
            <p className="text-muted-foreground text-sm" data-testid="text-no-scorecards">
              No saved scorecards yet. Complete a round and save it to see it here.
            </p>
          ) : (
            <div className="space-y-2">
              {scorecards.map((sc) => (
                <div
                  key={sc.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  data-testid={`card-scorecard-${sc.id}`}
                >
                  <div>
                    <p className="font-medium">{sc.courseName || 'Golf Round'}</p>
                    <p className="text-sm text-muted-foreground">
                      {sc.date} · {sc.holeCount} holes
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(sc.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-scorecard-${sc.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
