---
title: Passing data to templates
nav_order: 11
parent: Programming in PHP
---

# Passing data to templates

Take the following list of tasks:

```php
class Task
{
    public function __construct(
        public int $id,
        public string $title,
        public string $description,
        public ?string $long_description,
        public bool $completed,
        public string $created_at,
        public string $updated_at
    ) {
    }
}

$tasks = [
    new Task(
        1,
        'Buy groceries',
        'Task 1 description',
        'Task 1 long description',
        false,
        '2023-03-01 12:00:00',
        '2023-03-01 12:00:00'
    ),
    new Task(
        2,
        'Sell old stuff',
        'Task 2 description',
        null,
        false,
        '2023-03-02 12:00:00',
        '2023-03-02 12:00:00'
    ),
    new Task(
        3,
        'Learn programming',
        'Task 3 description',
        'Task 3 long description',
        true,
        '2023-03-03 12:00:00',
        '2023-03-03 12:00:00'
    ),
    new Task(
        4,
        'Take dogs for a walk',
        'Task 4 description',
        null,
        false,
        '2023-03-04 12:00:00',
        '2023-03-04 12:00:00'
    ),
];
```

One can set up a couple of routes which handle the list and in turn individual tasks:

```php
// access a Blade template
Route::get('/blade', function () use ($tasks) {
    // pass the sub-phrase that precedes .blade.php 
    // i.e. index (of index.blade.php), with variables
    return view('index', [
        // note that the HTML elements are escaped and 
        // displayed as literally given, blocking cross-site scripting attacks;
        // HTML elements would have to be defined in the template instead
        'name' => 'JimJom<script></script>',
        'tasks' => $tasks,
    ]);
})->name('tasks.show');

Route::get('/blade/{id}', function ($id) use ($tasks) {
    // pass the sub-phrase that precedes .blade.php 
    // i.e. index (of index.blade.php), with variables
    return 'Task selected: ' . $id . ', ' . $tasks[$id - 1]->title;
})->name('tasks.index');
```

The Blade template (`index.blade.php` in this case) can handle lists and 
return a new (simple) template with a string detailing each task:

```php
<div>
    <h2>
        Custom blade template
    </h2>
</div>

<div>
    {{--Check that the variable is defined with isset directive--}}
    @isset($name)
        {{--Only printed if the directive passed--}}
        The name passed: {{$name}}
    @endisset
</div>

<br/>

<div>
    @if(count($tasks))
        <div>Tasks presented: {{count($tasks)}}</div>
        <br/>
        @foreach($tasks as $task)
            <div>
                <li>{{$task->title}}</li>
            </div>
        @endforeach
    @else
        <div>No tasks presented</div>
    @endif
</div>

<br/>

{{--An alternative approach with forelse--}}
@forelse($tasks as $theTask)
    <li>{{$theTask->title}}</li>
@empty
    <div>No tasks presented</div>
@endforelse

<br/>

@forelse($tasks as $theTask)
    // --route() generates a URL; pass a 
    // key-value pair "id":"theTasksId" to the route with name tasks.index
    <li><a href="{{ route('tasks.index', ['id' => $theTask->id]) }}">{{ $theTask->title }}</a></li>
@empty
    <div>No tasks presented</div>
@endforelse
```
