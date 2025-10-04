function fn(data) {
    const [blog_list, frag] = [
        document.getElementById("blog_list"),
        document.createDocumentFragment()
    ]
    data.forEach(item => {
        const [li, a] = [
            document.createElement("li"),
            document.createElement("a")
        ]
        a.href = `articles/${item}.md`; a.innerText = item
        li.append(a); frag.append(li)
    })
    blog_list.append(frag)
}

fetch("articles/list")
    .then(data => data.text())
    .then(data => data.split("\n"))
    .then(data => fn(data))