#!/bin/bash

set -eux -o pipefail

# first we make some temp files to store each dirs contents
list_file=$(mktemp)
draw_file=$(mktemp)

# we then list all the files in the list and draw dirs respectively
$(cd ./lists && find . -type f | sort > "$list_file")
$(cd ./draws && find . -type f | sort > "$draw_file")

# we compare the contents to find files that exist as lists but not as draws
remaining_draw_filenames=$(comm -3 "$list_file" "$draw_file" |  awk '{print $1}')

# we then actually run the draw
while IFS= read -r filename; do
  # first we strip any leading ./
  count_to_draw="${filename#./}"
  # then we extract the number at the start of the filename
  count_to_draw="${count_to_draw%%-*}"

  # we then perform the draw, and write the output to the draw file
  dchoose  --count "$count_to_draw" --verbose < "./lists/$filename" > "./draws/$filename"
done <<< "$remaining_draw_filenames"

# clean up the temp files we created for storing the outputs of `ls`
rm -rf "$list_file" "$draw_file"
