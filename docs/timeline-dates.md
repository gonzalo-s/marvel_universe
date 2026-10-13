# Explicit story dates — 2026-10-13

Only `storyPeriod` supplies a visible story date. Missing metadata means no date
caption, panel date, or date in the marker's accessible name. Neither a release
year nor a grid anchor fills that gap. Dates derived from chronology books,
approximate placements, or arithmetic on time jumps are omitted.

The current film entries retain these verified on-screen dates:

| Film | Displayed date | Evidence and scope |
| --- | --- | --- |
| Iron Man 3 | 23 December 2013 | The Daily Times newspaper in the Rose Hill segment; not every scene. |
| Captain America: Brave New World | 16 April 2027 | White House summit invitation; not every scene. |
| The Fantastic Four: First Steps | 1964 | MCMLXIV in the opening; later time jumps are not compressed into this date. |

The visited-past event nodes in Endgame retain the explicit 1970, 2012, 2013,
and 2014 context dates. Undated events have no caption derived from the grid.

This is a conservative verified subset. Omitting a date means that this dataset
has no verified explicit evidence for its displayed period, not that the film
cannot contain a dated prop or dialogue. New dates require scene evidence.

Brand New Day remains released in 2026. Its explicit four-year interval after
No Way Home stays in the description; the calculated 2028 story caption is removed.
Other films also lose book-derived or estimated absolute years from descriptions.

`position.year` is an internal layout anchor, retained to preserve ordering,
connections, and scrolling. It is not exposed as a story date. `releaseYear`
continues to identify the theatrical release and powers TMDB lookup.

Evidence references:

- [Iron Man 3 newspaper date](https://fictionempire.com/index.php?cat=21st+Century%3A+10s&group=Dates&sub_cat=Headlines)
- [Brave New World on-screen invitation](https://movies.stackexchange.com/questions/124771/is-there-any-deeper-significance-to-the-april-16-2027-date-shown-in-captain-ame)
- [Fantastic Four opening date discussion](https://mcuchronological.wordpress.com/2025/11/14/part-73-the-fantastic-four-first-steps/)
- [Sony's Brand New Day synopsis](https://www.sonypictures.com/movies/spidermanbrandnewday)
