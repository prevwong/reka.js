import { getWebrtcProvider } from '@/utils';
import { CodeEditor } from '@rekajs/react-code-editor';
import * as React from 'react';
import { animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import randomColor from 'randomcolor';
import shortUUID from 'short-uuid';

export type User = {
  id: string;
  name: string;
  color: string;
};

type UserAvatarProps = {
  user: User;
  isLocal?: boolean;
};

const UserAvatar = (props: UserAvatarProps) => {
  return (
    <div
      className="relative overflow-hidden rounded-full px-2 py-0.5 text-xs text-center flex flex-col justify-center border border-solid border-black/10"
      style={{ backgroundColor: props.user.color }}
    >
      <span className="absolute left-0 top-0 w-full h-full bg-black/20"></span>
      <span className="relative text-white">
        {props.user.name}
        {props.isLocal && ` (You)`}
      </span>
    </div>
  );
};

export const Editor = () => {
  const [localUser, setLocalUser] = React.useState<User | null>(null);
  const [peers, setPeers] = React.useState<User[]>([]);

  React.useEffect(() => {
    const provider = getWebrtcProvider();

    // Create a local user
    const localUser: User = {
      id: shortUUID().generate(),
      name: uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: ' ',
        style: 'capital',
      }),
      color: randomColor(),
    };

    // Set local user and broadcast it to other peers
    setLocalUser(localUser);
    provider.awareness.setLocalState({
      user: localUser,
    });

    // Get a list of current peers
    const updatePeers = () => {
      const states = provider.awareness.getStates().values();

      const peers: User[] = [];

      for (const state of states) {
        if (!state.user) {
          continue;
        }

        if (state.user.id === localUser.id) {
          continue;
        }

        peers.push(state.user);
      }

      setPeers(peers);
    };

    updatePeers();

    // Keep the list of current peers updated
    provider.awareness.on('change', () => {
      updatePeers();
    });
  }, []);

  return (
    <div className="w-full h-full">
      <div className="px-3 py-2.5 bg-gray-100 flex gap-2 border-b-2 items-center">
        <span className="text-gray-700 text-xs mr-2">Users</span>
        {localUser && <UserAvatar user={localUser} isLocal={true} />}
        {peers.slice(0, Math.min(peers.length, 2)).map((peer) => (
          <UserAvatar user={peer} key={peer.id} />
        ))}
        {peers.length > 3 && (
          <span className="mx-1 text-xs text-gray-600">
            +{peers.length - 3} more
          </span>
        )}
      </div>
      <CodeEditor className="w-full h-full text-sm" />
    </div>
  );
};
