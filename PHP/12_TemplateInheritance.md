---
title: Template inheritance
nav_order: 12
parent: Programming in PHP
---

# Template inheritance

One can build web pages as a series of Blade templates, some of which actually function as a template.

The template (known as a Blade _partial_) found in `resources/views/layouts/app.blade.php` demonstrates templating:

```php
<!DOCTYPE html>
<html>

<head>
    <title>Task List App</title>
</head>

<body>
    <h1>@yield('title')</h1>

    <div>
        @yield('content')
    </div>

</body>

</html>
```

This template defines the overall 
layout of the page. The keywords `yield` are placeholders which reveal where 
"child" templates manage the content, with their own sections denoted by "title" and "content".

The following child template (found in `resources/views/show.blade.php`)
defines what goes on the placeholders, resulting in a detailed description of a single task:

```php
{{--Need to get this HTML layout to match app.blade.php in order to inherit the template--}}

{{--convention: directory.bladePrefix--}}
@extends('layouts.app')

{{--let the section handle HTML tags, no @endsection needed--}}

@section('title', $task->title)

@section('content')

    <p>{{ $task->description }}</p>

    @isset($task->long_description)
        <p>{{ $task->long_description }}</p>
    @endisset

    <p>{{ $task->created_at }}</p>
    <p>{{ $task->updated_at }}</p>

@endsection

{{--Check the page source to see this template has a head and body element--}}
```

The above template ("show") could be accessed from the following route:

```php
Route::get('/blade/{id}', function ($id) use ($tasks) {

    // users may manually enter the ID, so guard against overflows first
    $task = collect($tasks)->firstWhere('id', $id);

    if (!$task) {
        abort(ResponseAlias::HTTP_NOT_FOUND);
    }

    return view('show', ['task' => $task]);

})->name('tasks.index');
```

The following child template (found in `resources/views/list.blade.php`) shows how lists of tasks can be rendered:

```php
@extends('layouts.app')

@section('title', 'Task list')

@section('content')

    @forelse($tasks as $theTask)
        {{--route() generates a URL; pass a key-value pair "id":"theTasksId" to the route with name tasks.index--}}
        <li><a href="{{ route('tasks.index', ['id' => $theTask->id]) }}">{{ $theTask->title }}</a></li>
    @empty
        <div>No tasks presented</div>
    @endforelse

@endsection
```

The above template ("list") can be accessed with the following route:

```php
Route::get('/blade', function () use ($tasks) {

    // pass the sub-phrase that precedes .blade.php i.e. index (of index.blade.php), with variables
    return view('list', [
        'tasks' => $tasks,
    ]);

})->name('tasks.list');
```
