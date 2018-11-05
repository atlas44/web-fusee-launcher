# This repo is no longer being updated. I wish I could, but WebUSB is not going to be supported by most other browsers than Chrome due to its inability to be secured, and there is no way to write to a USB drive (and by extension a SD Card) so you can't write a script to load SDFiles quickly. Feel free to make pull requests, I may commit them, but I officially won't be trying to update this anymore. If you look at the code, I attempted to add the ability to download the latest payload from github and load it, but I failed. If you can get that working, I will accept that pull req

# web-cfw-loader
Fusee Launcher, in a browser!

# Description
This is a port of [fusee-launcher](https://github.com/reswitched/fusee-launcher) to JavaScript using WebUSB. This has been mildly tested and appears to work on Linux, Android (unrooted), OSX and ChromeOS. Today, this only works on Chrome because only Chrome implements WebUSB. It also does NOT work on Windows because the WebUSB Windows implementation does not allow sending the required USB packet.

# Forked
This is also a fork of [web-fusee-launcher](https://github.com/atlas44/web-fusee-launcher), which I fixed up a bit, added hekate 5 and 4, and did some CSS stuff.

# Try it out
Either use a web server to host the files (must be on https, because of the fact that WebUSB is new technology and therefore has a lot of security restrictions) or you can try it [on github pages](https://elijahzawesome.github.io/web-cfw-loader/).
