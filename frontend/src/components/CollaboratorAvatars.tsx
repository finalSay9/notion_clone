import { colorForUser } from '../lib/collabColors';

interface CollaboratorUser {
  clientId: number;
  name?: string;
  color?: string;
}

export function CollaboratorAvatars({ users }: { users: CollaboratorUser[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex -space-x-2">
      {users.map((u) => (
        <div
          key={u.clientId}
          title={u.name ?? 'Someone'}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold text-white"
          style={{ backgroundColor: u.color ?? colorForUser(String(u.clientId)) }}
        >
          {(u.name ?? '?')[0]?.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
