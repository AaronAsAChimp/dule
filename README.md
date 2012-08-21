Dule
====

Modules with less rather than mo.

A light weight implementation of AMD with no dependencies. It doesn't aim to be a 100% compliant implementation, but its tiny. In less than one packet, you can have an AMD enabled site.

TL;DR
-----
...do this
```javascript
<script src="dule.js"></script>
<script src="/modules/your-module.js"></script>
```

Why is this important?
----------------------

Most routers have a maximum transmission unit (MTU) of 1,500 bytes. So when a file is larger than that, your application has to wait until all of the packet have been received and reassembled. The Internet is chaotic place, packets can arrive out of order or even get lost on their way.

So, why are all those hipsters spriting, merging, and minifying?
----------------------------------------------------------------

Lets take a look at how a HTTP request is made.

### The Handshake (TCP)

	[syn] [syn/ack] [ack]

### Now the data (HTTP)

	[HTTP Request] [HTTP Response Packet 1] [HTTP Response Packet 2] .. [HTTP Response Packet N]

### Connection Termination (TCP)

	[fin] [fin/ack] [fin]


All of this happens for every file transferred. It adds up to about 1k of overhead. Now if you have a lot of resources, this can be significant.

The break down:
---------------

<table>
	<thead>
		<tr>
			<th></th>
			<th>Minified (bytes)</th>
			<th>GZipped (bytes)</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th>Dule 0.1.0 (bare)</th>
			<th>1,980</th>
			<th>748</th>
		</tr>
		<tr>
			<th>Dule 0.1.0 (full)</th>
			<th>2,496</th>
			<th>974</th>
		</tr>
		<tr>
			<th>Yepnope 1.5.4</th>
			<th>3,761</th>
			<th>1,789</th>
		</tr>
		<tr>
			<th>RequireJS 2.0.6</th>
			<th>14,845</th>
			<th>5,997</th>
		</tr>
	</tbody>
</table>


Errors:
-------

To keep the file small, the errors have also been minified. You will get the normal errors when using the unminified version. 

### Here's a cheat sheet:

* E:1 - Id is required when calling define
* E:2 - Circular dependency found
