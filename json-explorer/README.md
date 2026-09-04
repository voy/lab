# json-explorer

A browser tool for exploring JSON as an interactive tree.

Paste JSON into the left pane and get a live collapsible tree on the right.
Values are color-coded by type. Expand or collapse the entire tree in one click.

## The divider is the layout control

Drag it to resize; it snaps at 50/50. Drag it into the left edge and the input
collapses, leaving the tree full-width; drag it into the right edge and the tree
collapses, leaving a full-width editor. Click a parked divider to pull the pane
back out, double-click to reset, or cycle all three states with `⌘\`.

Parse errors show in a strip across the bottom, so they stay visible even with
the input pane collapsed.

Works entirely in the browser — nothing is sent anywhere. Follows your system
light/dark setting.
