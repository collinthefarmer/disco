export interface PlaybackActionInterface {
    id: number;

    src: PlaybackSourceInterface;
    url: string;
    next?: PlaybackActionInterface;
}

export interface PlaybackTarget {
    play: (action: PlaybackActionInterface) => Promise<void | PlaybackError>;
}

export interface PlaybackSourceInterface {
    id: string;
    name: string;
}

export class PlaybackError extends Error {}

export interface SessionInterface {
    /**
     * Unique id for this Session.
     */
    id: number;

    /**
     * Optional name for this session.
     */
    name: string | null;

    /**
     * ID of Voice Channel this session is tied to.
     */
    channelId: string;

    /**
     * Timestamp at which this session will expire if it receives no more play actions.
     */
    expiresAt: number;

    /**
     * Next PlaybackAction to be played. (should point to current.next)
     */
    next: PlaybackActionInterface | null;

    /**
     * Last PlaybackAction to be played.
     */
    last: PlaybackActionInterface | null;

    /**
     * PlaybackAction currently in progress
     */
    current: PlaybackActionInterface | null;

    /**
     * All PlaybackActions found by traversing .next
     */
    queue: PlaybackActionInterface[];

    /**
     * Previous states in order of last occurring (like a stack)
     */
    history: SessionInterface[];

    /**
     * Restore this session to the state of Session 'to'
     * @param to
     */
    revert: (to: SessionInterface) => void;
}

export interface SessionCommand {
    src: PlaybackSourceInterface;
    input: string;

    asAction(): PlaybackActionInterface;
}

export interface SessionManagerInterface {
    session: SessionInterface;

    /**
     * Add an item to the queue.
     */
    queuePush: (cmd: SessionCommand) => void;

    /**
     * Remove an item from the queue by index.
     */
    queueDrop: (i: number) => void;

    /**
     * Skip to an item in the queue by index.
     */
    queueGoto: (i: number) => void;
    /**
     * Skip to the next item in the queue.
     */
    queueSkip: () => void;

    // /**
    //  * Undo the last change to the queue.
    //  */
    // queueUndo: () => void;

    /**
     * Find the position of a command in the queue.
     */
    queueFind: (cmd: SessionCommand) => number;
}
