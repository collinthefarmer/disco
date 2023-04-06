export interface PlaybackAction {
    id: string;

    src: PlaybackSource;
    url: string;
    next?: PlaybackAction;
}

export interface PlaybackTarget {
    play: (action: PlaybackAction) => Promise<void | PlaybackError>;
}

export interface PlaybackSource {
    id: string;
    name: string;
}

export class PlaybackError extends Error {}

export interface Session {
    /**
     * Unique id for this Session.
     */
    id: string;

    /**
     * Optional name for this session.
     */
    name: string | null;

    /**
     * Next PlaybackAction to be played. (should point to current.next)
     */
    next: PlaybackAction | null;

    /**
     * Last PlaybackAction to be played.
     */
    last: PlaybackAction;

    /**
     * PlaybackAction currently in progress
     */
    current: PlaybackAction | null;

    /**
     * All PlaybackActions found by traversing .next
     */
    queue: PlaybackAction[];

    /**
     * Previous states in order of last occurring (like a stack)
     */
    history: Session[];

    /**
     * Restore this session to the state of Session 'to'
     * @param to
     */
    revert: (to: Session) => void;
}

export interface SessionCommand {
    src: PlaybackSource;
    input: string;

    asAction(): PlaybackAction;
}

export interface SessionManager {
    session: Session;

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

    /**
     * Undo the last change to the queue.
     */
    queueUndo: () => void;

    /**
     * Find the position of a command in the queue.
     */
    queueFind: (cmd: SessionCommand) => number;
}
