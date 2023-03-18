# Regular Expression with Java

Regular expressions are universal across programming environments. Here it is demonstrated in the the context of a Java application.

```java
// regular expressions are a sequence of characters that define a search pattern
    
String string = "I am a string";
System.out.println(string);

// the regular expressions are the first parameter, for example, of replaceAll
// replacements need not match the length of the regular expression
String yourString = string.replaceAll("I", "You");
System.out.println(yourString);

String alphanumeric = "abcdefghijk";
// look for b AND c AND d, in the given order
System.out.println(alphanumeric.replaceAll("bcd", "y"));
// missing d in between c and e, so false
System.out.println(alphanumeric.replaceAll("bce", "y"));
System.out.println(alphanumeric.replaceAll("dbc", "y"));
System.out.println(alphanumeric.replaceAll(".", "y"));

// ^matches at the start of the string
System.out.println(alphanumeric.replaceAll("^abc", "yyyyyy"));

String secondString = "abcdefghijkabcdefghijk";
System.out.println(alphanumeric.replaceAll("^abc", "xxxxxxxxxx"));
// no match, so no replacement
System.out.println(alphanumeric.replaceAll("^143", "yyyyyy"));

// does the regular expression match?
System.out.println(alphanumeric.matches("^abc"));
// it doesn't...the regexp needs to match the entire string,
// we'd need to write ^abcdefghijk
System.out.println(alphanumeric.matches("^abcdefghijk"));
// quite useful when checking for critical input (password checking etc)

// the caret signifies the beginning, the dollar sign signifies the end
System.out.println(alphanumeric.replaceAll("ghijk$", "theDudeIsBack"));

// [] focuses on a specific set of characters
System.out.println(secondString.replaceAll("[de]", "DEDE"));

// focus on a set only if it is followed by the second set
String thirdString = "abcdeFGhijkabcdefghijk";
System.out.println(thirdString.replaceAll("[de][FG]", "DEDE"));
```

Part 2 is give below:

```java
// this checks for upper or lower case H
System.out.println("Harry".replaceAll("[Hh]arry", "Harry"));

String thirdString = "abcdEfghijk999888777abcdefghijk";
// replace all except for lowercase e; the caret is inside the brackets
System.out.println(thirdString.replaceAll("[^ej]", "X"));

// the order in which the literals appear in the brackets matters not
System.out.println(thirdString.replaceAll("[dcba]", "X"));
System.out.println(thirdString.replaceAll("[abcdef345678]", "X"));

// shortcut to ranges (java increments automatically,
// a-e and 3-8 (no need to separate with a comma or hyphen)
System.out.println(thirdString.replaceAll("[a-e3-8]", "X"));
System.out.println(thirdString.replaceAll("[A-Z]", "X"));

// ignore case with (?iu) (i for ASCII and u for unicode)
System.out.println(thirdString.replaceAll("(?i)[a-e3-8]", "X"));
System.out.println(thirdString.replaceAll("(?u)[a-e3-8]", "X"));
System.out.println(thirdString.replaceAll("(?ui)[a-e3-8]", "X"));

// match all numerical digits
System.out.println(thirdString.replaceAll("\\d", "X"));

// match all non-numerical digits
System.out.println(thirdString.replaceAll("\\D", "X"));

String hasWhiteSpace = "I have blanks and\\t a newline\\nDude!___but_not_here";
System.out.println(hasWhiteSpace);
// finds all whitespace (tabs, space, newline)
System.out.println(hasWhiteSpace.replaceAll("\\s", "_"));
// tabs only
System.out.println(hasWhiteSpace.replaceAll("\\t", "X"));
// non-whitespace
System.out.println(hasWhiteSpace.replaceAll("\\S", "X"));

// except for underscore
System.out.println(hasWhiteSpace.replaceAll("\\W", "X"));
// replace everything other than whitespace
System.out.println(hasWhiteSpace.replaceAll("\\w", "X"));

// word boundaries b (surround each word with Xs) think HTML tags
System.out.println(hasWhiteSpace.replaceAll("\\b", "X"));
```

Quantifiers and pattern matchers are demonstrated below:

```java
// quantifiers signify how often an element can occur
String thirdString = "abcdEfghijk999888777abcdefghijk";
System.out.println(thirdString.replaceAll("^abcdEfghijk9", "F****"));

// replace more 9s (three)
String fourthString = "abcdEfghijk999888777abcdefghijk999888777";
System.out.println(fourthString.replaceAll("^abcdEfghijk9{3}", "F****"));

// replace all 9s after the start
System.out.println(fourthString.replaceAll("^abcdEfghijk9+", "F****"));

// replace letters up to the last character (9), whether it is present or not
System.out.println(fourthString.replaceAll("^abcdEfghijk9*", "F****"));
String fifthString = "abcdEfghijk000888777abcdefghijk999888777";
System.out.println(fifthString.replaceAll("^abcdEfghijk9*", "F****"));

// look for between 2 and 5 with {2,5} 9s
System.out.println(fifthString.replaceAll("^abcdEfghijk0{2,5}", "F****"));
System.out.println(fifthString.replaceAll("^abcdEfghijk0{1,2}", "F****"));

// replace all i (must be >= 1), >=0 j and then k0, in that order
String sixthString = "abcdEfghiiijK000888777abcdefghiiijk000888777iii_jjk0_iiik0";
System.out.println(sixthString.replaceAll("i+j*k0", "F****"));

// looking for HTML tags
StringBuilder htmlText = new StringBuilder("<h1>My Heading</h1>");
htmlText.append("<h2>Subheading</h2>");
htmlText.append("Some paragraph");
htmlText.append("<h2>Subheading2</h2>");
htmlText.append("Some paragraph2");

// using the Pattern and Matches classes
// Matcher: An engine that performs match operations 
// on a character sequence by interpreting a Pattern.
// Pattern: A compiled representation of a regular expression.

// dot matches any character and star signifies one or more 
// of dot...without these, matches returns false
// matches is analysing the compiled pattern as a whole
String h2Pattern = ".*<h2>.*";
Pattern pattern = Pattern.compile(h2Pattern);
Matcher matcher = pattern.matcher(htmlText);
System.out.println(matcher.matches());
// matcher now needs to be updated*

Pattern pattern2 = Pattern.compile(h2Pattern, Pattern.CASE_INSENSITIVE);
Matcher matcher2 = pattern2.matcher(htmlText);
System.out.println(matcher2.matches());

// reset matcher*
matcher.reset();

System.out.println("Find h2 across the whole string:");
int count = 0;
while(matcher.find()) {
count++;
// end() shows the index of the following element
// (to but not including as such)
System.out.println("Occurrence " + count + " : " 
+ matcher.start() + " to " + matcher.end());
}
// this handles the entire string. To focus on one h2 tag,
// redefine the h2Pattern

System.out.println("Find h2 as they appear in whole string:");
String h2Pattern2 = "<h2>";
Pattern pattern3 = Pattern.compile(h2Pattern2);
Matcher matcher3 = pattern3.matcher(htmlText);
count = 0;
while(matcher3.find()) {
count++;
// end() shows the index of the following element
// (to but not including as such)
System.out.println("Occurrence " + count + " : " 
+ matcher3.start() + " to " + matcher3.end());
}

// using groups to find occurrences
String h2GroupPattern = "(<h2>)";
Pattern groupPattern = Pattern.compile(h2GroupPattern);
Matcher groupMatcher = groupPattern.matcher(htmlText);
// check if a matcher is present initially
System.out.println(groupMatcher.matches());
groupMatcher.reset();

while(groupMatcher.find()) {
// group(0) is the entire character sequence 
// (group() defaults to group(0)) 
// group(1) represents the first group defined by 
// h2GroupPattern (one can pass multiple groups)
System.out.println("Occurrence " + groupMatcher.group(1));
}

// using groups to find occurrences (a group is enclosed in 
// parentheses); we use the ? quantifier to turn a greedy 
// quantifier into a a lazy quantifier, so * does not keep 
// looking for </h2> after the first find
// recall, + looks for >= 1 and * looks for >= 0, so .+ 
// would ignore empty h2 tags
String h2GroupPattern2 = "(<h2>.*?</h2>)";
Pattern groupPattern2 = Pattern.compile(h2GroupPattern2);
Matcher groupMatcher2= groupPattern2.matcher(htmlText);
// check if a matcher is present initially
System.out.println(groupMatcher2.matches());
groupMatcher2.reset();

while(groupMatcher2.find()) {
// group(0) is the entire character sequence, group(1) 
// represents the first group defined by h2GroupPattern 
// (one can pass multiple groups, see below)
System.out.println("Occurrence " + groupMatcher2.group(1));
}

//multiple groups
String h2TextGroups = "(<h2>)(.+?)(</h2>)";
Pattern h2TextPattern = Pattern.compile(h2TextGroups);
Matcher h2TextMatcher = h2TextPattern.matcher(htmlText);

while(h2TextMatcher.find()) {
// the closing h2 tag is group(3)
System.out.println("Occurrence: " + h2TextMatcher.group(2));
}
```

Some more examples with AND, OR and NOT boolean logic:

```java
//have OR operations implicitly
System.out.println("Harry".replaceAll("[Hh]arry", "Harry"));

System.out.println("harry".replaceAll("[Hh]arry", "Harry"));

//with the OR ¦ operator
System.out.println("Harry".replaceAll("[H¦h]arry", "Harry"));

//using NOT
System.out.println("Harry".replaceAll("[^arry]", "*"));
System.out.println("Harry".replaceAll("H[^arry]", "*"));


//use of the NOT operator with !
//(? is a look ahead operation, 
    // [^abc]
        String tvTest = "tstvtkt";

        // for reference, tNotVRegExp = "t[^v]";
        //**look for t which is not followed by a v
        String tNotVRegExp = "t(?!v)";
        Pattern tNotVPattern = Pattern.compile(tNotVRegExp);
        Matcher tNotVMatcher = tNotVPattern.matcher(tvTest);

        int count = 0;
        while(tNotVMatcher.find()) {
            count++;
            System.out.println("Occurrence " + count + " : " 
            + tNotVMatcher.start() + " to " + tNotVMatcher.end());
        }

        //**look for t followed by a v
        // t(?=v)
        // ^([\(]{1}[0-9]{3}[\)]{1}[ ]{1}[0-9]{3}[\-]{1}[0-9]{4})$
        String phone1 = "1234567890";     // Shouldn't match
        String phone2 = "(123) 456-7890"; // match
        String phone3 = "123 456-7890";   // Shouldn't match
        String phone4 = "(123)456-7890";  // Shouldn't match

        System.out.println("phone1 = " + phone1.matches(
        "^([\\(]{1}[0-9]{3}[\\)]{1}[ ]{1}[0-9]{3}[\\-]{1}[0-9]{4})$"));
        System.out.println("phone2 = " + phone2.matches(
        "^([\\(]{1}[0-9]{3}[\\)]{1}[ ]{1}[0-9]{3}[\\-]{1}[0-9]{4})$"));
        System.out.println("phone3 = " + phone3.matches(
        "^([\\(]{1}[0-9]{3}[\\)]{1}[ ]{1}[0-9]{3}[\\-]{1}[0-9]{4})$"));
        System.out.println("phone4 = " + phone4.matches(
        "^([\\(]{1}[0-9]{3}[\\)]{1}[ ]{1}[0-9]{3}[\\-]{1}[0-9]{4})$"));

        // ^4[0-9]{12}([0-9]{3})?$
        String visa1 = "4444444444444"; // should match
        String visa2 = "5444444444444"; // shouldn't match
        String visa3 = "4444444444444444";  // should match
        String visa4 = "4444";  // shouldn't match

        System.out.println("visa1 " + visa1.matches("^4[0-9]{12}([0-9]{3})?$"));
        System.out.println("visa2 " + visa2.matches("^4[0-9]{12}([0-9]{3})?$"));
        System.out.println("visa3 " + visa3.matches("^4[0-9]{12}([0-9]{3})?$"));
        System.out.println("visa4 " + visa4.matches("^4[0-9]{12}([0-9]{3})?$"));
```
