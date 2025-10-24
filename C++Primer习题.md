---
title: "C++Primer习题"
author: "mob_dolloge"
date: "2025-10-23"
status: "编辑中"
---

## 11.2.1节习题

### 练习11.5
> 解释map和set的区别。你如何选择使用哪个？

map和set都是关联容器，而且里面元素的关键字不能重复；但是map的元素不仅包括关键字还包括值，而set的元素只包括关键字，换句话说set的关键字就是set的值。

如果存储几组家庭人员信息，那么需要区分每条信息中哪些是电话号码哪些是姓名，就需要关键字来规定这些值的类别，可以使用map；而对于那些每一条数据都是一个类别的数据集，使用set存储更方便。

### 练习11.6
> 解释set和list的区别。你如何选择使用哪个？

list是顺序容器而set是关联容器，一些能用在顺序容器的操作无法用在set上。另外list一般支持重复元素，而set不支持。

所以，想要去重且不考虑顺序只是归类时，使用set会比较方便；如果想要实现一些更复杂的数据结构，用list会更好一点。

### 练习11.7
> 定义一个map，关键字是家庭的姓，值是一个vector，保存家中孩子（们）的名。编写代码，实现添加新的家庭以及向已有家庭中添加新的孩子。

```cpp
#include <map>
#include <string>
#include <vector>

using std::map;
using std::string;
using std::vector;

int main() {
    map<string, vector<string>> kid_name{};
    // 添加新的家庭
    kid_name.insert({"Zhang", {}});
    // 向已有家庭添加孩子名字
    kid_name["Zhang"].emplace_back("Zixuan");
}
```

### 练习11.8
> 编写一个程序，在一个vector而不是一个set中保存不重复的单词。使用set的优点是什么？

使用set的优点是可以直接使用标准库提供的去重功能。如果不用set而用vector的话应该如下表示：

```cpp
#include <vector>
#include <string>
#include <iostream>
#include <algorithm>// std::find

int main() {
    std::vector<std::string> words;
    std::string word;
    while(std::cin >> word) {
        auto it = std::find(words.begin(), words.end(), word);
        if(it == words.end())
            words.emplace_back(word);
    }
}
```

## 11.2.2节练习题

### 练习11.9
> 定义一个map，将单词与一个行号的list关联，list中保存的是单词出现的行号。

```cpp
std::map<std::string, std::list<std::size_t>> line_no;
```

### 练习11.10
> 可以定义一个vector<int>::iterator到int的map吗？list<int>::iterator到int的map呢？对于这两种情况，如果不能，解释为什么？

可以定义`vector<int>::iterator`到`int`，但是这不安全，因为vector添加元素后会导致内容迁移内存，原来的迭代器可能会失效，除非能保证vector不会再添加元素；而`list<int>::iterator`到`int`是完全可以的。

### 练习11.11
> 不使用decltype重新定义bookstore。其中：
> bool compareIsbn(const Sales_data &lhs, const Sales_data &rhs) { ... }
> multiset<Sales_data, decltype(compareIsbn) *> bookstore(compareIsbn);

```cpp
multiset<Sales_data, bool(*)(const Sales_data &, const Sales_data &)>
bookstore(compareIsbn);
// 不能传一个函数类型，传函数指针类型可以，因为函数类型无法被实例化，也无法构造对象
```