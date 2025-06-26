import React from 'react';

type OnlineUsersProps = {
  onlineUsers?: {
    [userId: string]: {
      username: string;
    };
  };
  limit?: number;
};

// Función para generar un color basado en el userId (hash simple)
function getColorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 60%)`;
  return color;
}

// Extrae iniciales del username
function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

const OnlineUsersList: React.FC<OnlineUsersProps> = ({ onlineUsers = {}, limit = 10 }) => {
  const entries = Object.entries(onlineUsers).slice(0, limit);

  return (
    <div className="flex gap-2 flex-wrap">
      {entries.map(([userId, { username }]) => (
        <div
          key={userId}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow"
          style={{ backgroundColor: getColorFromId(userId) }}
          title={username}
        >
          {getInitials(username)}
        </div>
      ))}
    </div>
  );
};

export default OnlineUsersList;
