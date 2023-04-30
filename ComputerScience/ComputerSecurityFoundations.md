---
title: Foundations of Computer Security
nav_order: 3
parent: Computer Science
---

# Foundations of Computer Security

This article focuses primarily on software security, and in particular to software running in a network.

## Access Control

Software has various mechanisms by which it can protect data. An agent (a service that has a specific role and normally has full access to the system) oversees how actors (users) access the data and what they can do with/to the data. The functions available to an actor, without getting blocked by the agent, can be categorised as folows:

+ Read-access
+ Write-acess
+ Execute-access - actor can direct the agent to execute commands

The above levels of access are independent of each other and can be assigned to an actor in any combination. The approach by which data is secured as described above is known as _access control_.

As expected, when an actor is granted read-access to the data, then the data is not considered confidential to the actor. 

Access control is typically implemented and enforced with the aid of cryptopgraphy.

## Cryptography

Cyrptography is obviously a large subject and not covered in detail here. We go through the commonly applied terms and concepts.

Data that has not been encrypted is referred to as _plaintext_. The same data that passes through an encryption algorithm is then referred to as _ciphertext_. The encryption algorithm typically performs a specific type of encryption that is denoted by the _key_.

A mechanism that uses the same key for both encryption and decryption of data is known as _symmetric encryption_. The recommended standard of symmetric encryption to data is defined under the Advanced Encryption Standard or [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard).

The mechanism by which a different key is used for encryption and deryption is known as _asymmetric encryption_.

## Data Integrity and hashing

Data integrity relates to data modification. If an actor has write-access to the data then they can make modifications to the data or, in other words, control the integrity of the data.

Symmetric encryption can ensure that the plaintext data is not modified by unauthorised actors or adversaries. However, this approach does not necessarily prevent modification of the ciphertext. Doing so, would mean that the decryption of the ciphertext would result in modified (and perhaps incomprehenisible) plaintext.

To get around this problem, one can use [_hashing_](https://en.wikipedia.org/wiki/Hash_function). Hashing is a process defined by a function that takes a fixed and randomly chosen section of the data (known as a _blob_) and encrypts (and in many cases compresses) it to yield a _hash_ (an encypted blob). This hash is almost always unique and depends on the data itself as well as the starting position and length of the blob. The process of encrypting the blob with the same algorithm and key would result in the same hash. The value of the hash is normally saved elsewhere and encrypted again.

If an adversary attempts to modify the original ciphertext or the data blob, then this would result in a different hash value. Hence, by taking the decrypted data, as plaintext, and then performing the hash function on the same data blob, one can determine if the ciphertext was modified or not. As the reader will note, __hashing is a one-way function__: it is largely impossible to convert a hash value to a data blob.

Some of the more common hashing methods in use are the Secure Hash Algorithm (SHA) methods, for example, [SHA-2](https://en.wikipedia.org/wiki/SHA-2) and [SHA-3](https://en.wikipedia.org/wiki/SHA-3).

## Encrytion across networks

Symmetric encryption works well on a single system. However, across networks, symmetric encryption becomes a problem. this due to the way in which networks allow _all_ actors to communicate and receive packets.

If two actors want to shared encrypted data and keys, they must do this in potentially full view of adversaries. How do two actors send the ciphertexts and keys without said packets getting intercepted by adversaries?

An answer is to use assymetric encryption instead. Here the file author encrypts there data using a _public key_ and then proceeds to send the data to the intended recipient as ciphertext. The recipient then uses a _private key_ to decrypt the ciphertext. Both actors would first have to agree on which public and private keys to use before passing ciphertexts.

Assymetric encryption is quite expensive and normally only performed on small files. Instead of encrypting and decrypting the data itself under assymetric encryption, the actors instead define a symmetric key for the transaction that will be applied to the data transmitted. 

For example, an actor (as a client) would send their public key to a server and have their private key on their system. 

1. The generation of the private and public keys is performed on the same system i.e. the client. The private key is normally protected by a passcode that the user must enter before proceeding with decryption.

When the client logs in to the server, they must first establish a symmetric key. 

2. The server receives the request from the client to log in, generates a symmetric key and then uses the client public key (it received beforehand) to encypt the symmetric key. 
3. The server sends the symmetric key as a ciphertext to the client.
4. The client then decrypts the ciphertext with their private key.

Since adversaries would not know what the private key is they would not be able to decrypt the symmetric key ciphertext, and therefore not know (in reality) how to decrypt the encrypted packets. They might be able to see the packets but have little to no idea about how to unravel them.

## Concatenating secrets with salts

A salt is a randomly generated sequence of characters that is used to introduce more barriers to adversaries who would otherwise eventually determine a secret e.g. a password.

If an adversary knows the length of a password and what characeter set is used, then they will be able to build their own dictionary of plaintexts and ciphertexts. Clearly, the longer the password, the larger the dictionary and the longer it will take for the adversary to look up the plaintext password.

By concatenating the password with a salt, e.g. a 64-bit random number, it means that the adversaries dictionary will need to generate from or store ```2^64``` entries. Thus it reduces the likelihood that an adversary can get the password.

Random numbers are actually quite difficult to generate from a deterministic computer system. Some random number generators take in values of current events e.g. surrounding temperature, fan speed etc., which are difficult to forsee ahead of time, and then build algorithms which take in said parameters in emulating randomness.

## Exploting vulnerabilities with Malware

Software bugs crop up everywhere. Non-security related bugs affect user experience and functionality, whereas security related bugs affect the security of the system. These latter problems are known as _vulnerabilities_.

Malicious software that attempts to exploit vulnerabilities is referred to as _Malware_. Security researchers focus on identifying malware and then build a fingerprint, known as a _signature_ to identify the malware. The signature is uploaded to an antivirus scanner. If the scanner finds software i.e. malware with matching signatures, then the antivirus software alerts the user of the vulnerability and 'deletes' the malware.

As the number of malware found increases, so too does the number of signatures required to characterise it. This has been an ever-growing challenge for the security industry. More modern approaches using AI have helped antivirus companies with identifying malware and eradicating it.

## Securing physical devices

If a physical storage device is stolen then it then makes it possible for the adversary to steal the data. Many operating systems provide data encryption with keys that are bound to the user (by their login credentials) and the physical computer system originally used to access the system. This helps to ensure that stolen drives cannot be accessed through other machines and user accounts.

## Writing secure programs

The following are general principles which apply to all forms of software development:

+ Validate the input parameters i.e. make sure that mandatory values are supplied and in range. Some systems also modify input (known as _sanitisation_) so that it conforms to the service's standard (e.g. use double quotes in place of single quotes, or removing whitespace etc.) however this also runs the risk of modifying the intent of the message (the control) or removing innocuous characters (the content).
+ Sanitise output, making sure that the service provides data that conforms to the recipient's requirements. Calls to a SQL database should fail because the transaction could not complete, __not__ because the SQL statement syntax was wrongly formatted. Developers also take the opportunity to follow the _principle of least privilege_: only provide the minimum needed to get the job done.
+ Break down the system into independent modules such that each is responsible for their own part of the solution. A problem identified in one module will not spill over to others.
+ Use industry-standard cryptography where possible. Do no try to build your own.
+ Avoid memory overflows (a common exploit), making sure the heap is cleared when appropriate. This is particularly important for languages that do not use garbage collection (for example C and C++).
+ Integrate or implement an auditing system, recording system usage as logs independent of other in-built audit trails. Ensure that the logs are protected and cannot be modified.
+ Make sure logs do not print or record secrets.
+ Keep secrets away from source code and saved to a independent volume or encrypted drive. 
+ Establish a _key rotation_ policy, changing secrets on a regular basis.
+ Do not ignore compiler warnings.
+ Make sure functions are only given access to data they need. Follow the principle of least privilege.
+ Standardise secure coding practices across the development team.
+ Run static (pre-runtime) and dynamic (at runtime) code analysis tools to identify errors. Most modern IDEs come with _linters_ that perform static analysis.
+ Carry out code reviews when possible!
+ Get a recovery plan ready. Software will never be 100% secure and the battle will be ongoing!
