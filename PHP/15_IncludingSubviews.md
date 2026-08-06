---
title: Including subviews
nav_order: 15
parent: Programming in PHP
---

# Including subviews

Take the following template (`resources/views/form.blade.php`), technically a _subview_, which itself refers to partials:

```php
@extends('layouts.app')

@section('title', isset($task) ? 'Edit task' : 'Add task')

@section('styles')
    <style>
        .error-message {
            color: red;
            font-size: 0.8rem;
        }
    </style>
@endsection

@section('content')
    {{--    list all Laravel errors here --}}
    {{--    {{ $errors }}--}}

    <form method="POST" action="{{ isset($task) ? route('tasks.update',
     ['task' => $task->id]) : route('tasks.store') }}">

        {{--Laravel middleware builds templates that protect 
        against cross-site request forgery attacks --}}
        @csrf

        @isset($task)
            @method('PUT')
        @endisset

        <div>
            <label for="title">
                Task title
            </label>

            {{-- HTML form POST only: get Laravel to recall 
            valid data entry; use current title if not null (i.e. when
             updating) and any valid title prior to form submission --}}
            <input name="title" id="title" value="{{ $task->title ?? old('title') }}"/>
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

            {{-- HTML form POST only: get Laravel to recall valid data entry --}}
            <textarea name="description" id="description" rows="5">
                {{ $task->description ?? old('description') }}
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

            {{-- HTML form POST only: get Laravel to recall valid data entry --}}
            <textarea name="long_description" id="long_description" rows="10">
                {{ $task->long_description ?? old('long_description') }}
            </textarea>
        </div>

        @error('long_description')

        <p class="error-message">
            {{ $message }}
        </p>
        @enderror

        <div>
            <button type="submit">
                @isset($task)
                    Update task
                @else
                    Add task
                @endisset
            </button>
        </div>
    </form>

@endsection
```

One can embed the above subview into other templates with the keyword `@include`:

```php
    // some other Blade template

    {{-- Include the form.blade.php subview   --}}
    @include('form', ['task' => $task])


    // passing a entity is not required, in which case the form will
    // be blank
    @include('form')
```
