---
title: Injecting entities
nav_order: 14
parent: Programming in PHP
---

# Injecting entities

One can reference entities by passing a specific field for the given object spec. The following template assigns the key "task" with the task ID, which 
the GET request can intercept.

```php
@extends('layouts.app')

@section('title', 'Task list')

@section('content')
    @forelse($tasks as $theTask)
        {{--route() generates a URL; pass a key-value pair "id":"theTasksId" to the route with name tasks.index--}}
        <li><a href="{{ route('tasks.index', ['task' => $theTask->id]) }}">{{ $theTask->title }}</a></li>
    @empty
        <div>No tasks presented</div>
    @endforelse
@endsection
```

The route "tasks.index" would be defined as follows. Note the name of the parameter is the same as that passed.

```php
Route::get('/blade/{task}', function (Task $task) {

    // attempt to return the entity, or return a 404 if null
    return view('show', ['task' => $task]);

})->name('tasks.index');
```

Similarly, one can invoke an edit screen for the task, via a PUT request.

```php
@extends('layouts.app')

@section('title', 'Edit task')

@section('styles')
    <style>
        .error-message {
            color: red;
            font-size: 0.8rem;
        }
    </style>
@endsection

@section('content')
    <form method="POST" action="{{ route('tasks.update', ['task' => $task->id]) }}">
        @csrf
        {{-- HTML forms only support GET and POST; apply method spoofing with @method: redirect to a route with PUT instead of POST --}}
        @method('PUT')
        <div>
            <label for="title">
                Task title
            </label>
            <input name="title" id="title" value="{{ $task->title }}"/>
        </div>

        @error('title')
        <p class="error-message">
            {{ $message }}
        </p>
        @enderror

        <div>
            <label for="description">
                Description
            </label>
            <textarea name="description" id="description" rows="5">
                {{ $task->description }}
            </textarea>
        </div>
        @error('description')
        <p class="error-message">
            {{ $message }}
        </p>
        @enderror

        <div>
            <label for="long_description">
                Long description
            </label>
            <textarea name="long_description" id="long_description" rows="10">
                {{ $task->long_description }}
            </textarea>
        </div>
        @error('long_description')
        <p class="error-message">
            {{ $message }}
        </p>
        @enderror

        <div>
            <button type="submit">Edit task</button>
        </div>
    </form>
@endsection
```

The route would then take the following definition:

```php
Route::put('/blade/{task}', function (Request $request, Task $task) {
    $data = $request->validate([
        'title' => 'required|max:255',
        'description' => 'required',
        'long_description' => 'required',
    ]);

    // Laravel will automatically return a 404

    // still don't need the Model definition
    $task->title = $data['title'];
    $task->description = $data['description'];
    $task->long_description = $data['long_description'];

    // this handles save/update db transaction automatically
    $task->save();

    // save key-value "success":"Task created!" to session, flash as message, and then remove the key-value pair from
    // the session
    return redirect()->route('tasks.show', ['task' => $task])
        ->with('success', 'Task updated!');

})->name('tasks.update');
```
