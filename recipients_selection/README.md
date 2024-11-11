# Recipients selection

This directory contains everything related to the draw process.
Recipients lists are added to a private repo, their names are salted and
then the hashed versions get committed (automatically) to files in the
[./lists](./lists) directory. Once a new hashed recipient list hits the
main branch of this repo, the
[github draw action](../.github/workflows/execute-draw.yml) runs the
[draw.sh](./draw.sh) script. That script filters for lists that don't
have a corresponding draw, parses the filename for the number of
recipients to draw from the list, and triggers a draw using
[drand](https://drand.love). The randomness is not known until after the
list has been committed to, thus ensuring the selection process cannot
be biased. The output of that draw is then committed to a corresponding
file in the [./draws](./draws) directory. These draws are repeatable -
you can take the hashed recipient list and the corresponding drand
randomness, and re-run the draw using the
[dchoose](https://github.com/drand/dchoose) tool to confirm that the
outputs are the same. For further information on the draw process, check
out the
[Social Income website](https://socialincome.org/transparency/recipient-selection).
