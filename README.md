# [Novemator](https://rascaltwo.github.io/Novemator/)

[![pages-build-deployment](https://github.com/RascalTwo/Novemator/actions/workflows/pages/pages-build-deployment/badge.svg)](https://rascaltwo.github.io/Novemator/)

![screenshot of game](https://user-images.githubusercontent.com/9403665/159194192-c1aee587-496e-4e31-b64f-e6a7e26bf379.png)

A game in which the user must use a keypad with it's numbers and operators shuffled daily to generate a secret number.

> A new top-of-the-line security keypad has been developed to keep out anyone without sufficient mathematical skills, with daily reshuffling they're impenetrable!

> You find nine of these, will you be able to enter any today?

**Link to project:** https://rascaltwo.github.io/Novemator/

## How It's Made

**Tech used:** HTML, CSS, JavaScript, WebWorkers

After the game difficulty is chosen, a randomizer is generated with a seed of today using the SFC32 RNG, allowing for the same possible buttons to be generated each day. Then the chosen difficulty & available button options are passed off to a WebWorker, which performs the expensive calculations to find a valid target number given the inputs. This is then passed back to the main thread, allowing the user to play the game.

## Optimizations

The primary optimization is the use of a WebWorker to perform the expensive calculations, therefore any optimizations to these calculations will be greatly beneficial, possible to the point of moving the calculations back to the main thread. There already exist optimizations to the calculations to get to the current speed, from usage of Map objects to the storing of results in a Trie.

Possible future features include the ability to link to a specific day, increasing the shareability of results, along with a leaderboard, and by extension the ability to directly complete against others.

## Lessons Learned

The newest lesson learned was the variety and usage of seeded RNGs, in addition to the practice of optimizing code to run as fast as possible, then once a reasonable limit is reached, to make the delay as unnoticeable as possible - in this case, by using a WebWorker.

## Attributions

- [DSEG Font](https://www.keshikan.net/fonts-e.html)
