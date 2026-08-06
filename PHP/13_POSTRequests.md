---
title: POST requests and data validation
nav_order: 12
parent: Programming in PHP
---

# POST requests and data validation

In the the context of data management, HTTP POST requests typically serve to create new entities.

Continuing on with the Blade partials, the following found in  defines the web page form:

```php
@extends('layouts.app')

@section('title', 'Add task')

@section('content')
    <form method="POST" action="{{ route('tasks.store') }}">

        // Laravel middleware builds templates that protect 
        // against cross-site request forgery attacks
        @csrf

        // HTML forms only support GET and POST; apply method spoofing 
        // with @method: redirect to a route with PUT instead of POST
        // @method('PUT')

        <div>
            <label for="title">
                Task title
            </label>
            <input name="title" id="title"/>
        </div>

        <div>
            <label for="description">
                Description
            </label>
            <textarea name="description" id="description" rows="5"></textarea>
        </div>

        <div>
            <label for="long_description">
                Long description
            </label>
            <textarea name="long_description" id="long_description" rows="10"></textarea>
        </div>

        <div>
            <button type="submit">Add task</button>
        </div>
    </form>
@endsection
```

The POST request (which includes validation) is handled by the following route:

```php
Route::post('/blade', function (Request $request) {

    $data = $request->validate([
        'title' => 'required|max:255',
        'description' => 'required',
        'long_description' => 'required',
    ]);

    // if validation fails, then we exit right here and the user is redirected 
    // back to this view with a list of errors 
    // (under {{ $errors }} in the template)

    // Errors are saved to the User's session (browser gets a copy as a cookie) 
    // and can be saved to /storage/framework/sessions, or saved to the sessions 
    // db table (see .env for SESSION_DRIVER), the JSON payload
    // is base64 encoded

    // validation passed...
    $task = new Task;

    // still don't need the Model definition
    $task->title = $data['title'];
    $task->description = $data['description'];
    $task->long_description = $data['long_description'];
    $task->save();

    // save key-value "success":"Task created!" to session, 
    // flash as message, and then remove the key-value pair from
    // the session
    return redirect()->route('tasks.show', ['task' => $task])
        ->with('success', 'Task created!');

})->name('tasks.store');
```

Within the template to the route "tasks.show" would be a placeholder for the key "success":

```php
{{-- to check: getting session key-value pairs only accessible from app.blade.php? --}}
@if(session()->has('success'))
    <div style="color: green; font-size: 0.8rem; background: lightgreen">
        {{ session('success') }}
    </div>
@endif
```

If there was for example an error with the title (it was missed, or exceeded 255 characters), then
the same template can be used to report the error to the users with the following snippet near
the field for "title":

```php
@error('title')
        <p class="error-message">
            {{ $message }}
        </p>
        @enderror
```

This means much of the boilerplate code for basic operations need not be implemented.
