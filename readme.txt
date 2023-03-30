basic concept:

- bot listens for commands to play music
- when song is queued, use spotify player api to start playing that song
- if additional songs are queued, start storing them in a db as a session queue
- estimate time when currently playing song will be complete, and (with some buffer) pop \
\ the next song out of the session queue into the spotify queue
    - we do this rather than immediately place the next track in the spotify queue because \
    \ it lets us more flexibly manage song order without having to constantly make adjustments
    \ to each user's playback queue


components:

- discord/spotify bot registration
- user auth with spotify
    - store data needed to link discord and spotify users

- database to store queue, user data
- platform to run bot, store database

- api to manage database objects

- discord chat commands for managing queue
    - pause
    - play
        - play to start (paused) playback
        - play to add track(s)
    - stop
    - goto
        - skip (goto next)
        (++reaching++)
    - ++ manage session queue
        - ++ start/stop/close/open sessions
        - ++ could be a neat social feature add to track \
        \ who played what when
- spotify search/autocomplete when adding songs with commands
    - subcommands/options to alter search results
- some way to communicate session status to participants ((++in progress++)??

- maybe userInteraction or modal to let users change \
\ their settings / manage data without commands
    - or even do a lil spa to look official




- maybe some means to schedule tasks?
    - could just keep them in memory on timers but if bot process \
    \ ends you lose any currently running queues

- some way to deal with ads
    - # spotify docs hint that you cant even do the player api \
        \ with free accounts, so maybe this isn't necessary and \
        \ premium is just a requirement
    - obvs approach is just queue tracks and ignore sync issues
    - could additionally schedule task to check for ad playback \
        \ right as song ends and try to pause playback for everyone not getting an ad


... more i'm not thinking of