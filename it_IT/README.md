# web-cfw-loader
Fusee Launcher, in a browser!

# Description
This is a port of [fusee-launcher](https://github.com/reswitched/fusee-launcher) to JavaScript using WebUSB. This has been mildly tested and appears to work on Linux, Android (unrooted), OSX and ChromeOS. Today, this only works on Chrome because only Chrome implements WebUSB. It also does NOT work on Windows because the WebUSB Windows implementation does not allow sending the required USB packet.

# Forked
This is also a fork of [web-fusee-launcher](https://github.com/atlas44/web-fusee-launcher), which I fixed up a bit, added hekate 5 and 4, and did some CSS stuff.

# Try it out
Either use a web server to host the files (must be on https!) or you can try the [demo](https://elijahzawesome.github.io/web-cfw-loader/).
