---
title: "How to be a Front-end Developer"
description: "Sustainable communities are essential for the well-being of both people and the planet"
image: "/images/blog/13.jpg"
date: "2022-05-23"
category: "developer"
---

*Sustainable communities are essential for the well-being of both people and the planet. They are designed to minimize environmental impact, promote social equity, and enhance the overall quality of life. In creating such communities, architecture plays a crucial role.*


Architecture is not solely about creating aesthetically pleasing structures; it also has the power to shape our environment in a sustainable manner. From the design phase to construction and beyond, architects have the opportunity to incorporate sustainable principles that can significantly impact the community.


> "Good product come from good people, and all problems are solved by good design. Keep doing good design." 
> <cite>— Stephen Gardiner</cite>

Architects can employ various strategies to foster sustainability. First and foremost, they can prioritize energy efficiency by designing buildings that minimize energy consumption and incorporate renewable energy sources. This includes utilizing natural lighting, employing energy-efficient materials, and implementing efficient insulation systems.

Furthermore, sustainable architecture promotes the use of eco-friendly materials, such as recycled and locally sourced materials, which reduces the carbon footprint associated with construction. By considering the life cycle of materials and designing for disassembly, architects can enable easier recycling and reuse in the future.

## Navbar active State

```javascript
useEffect(() => {
  const activeLink = navRef.current.querySelector(".active");
  if (activeLink) {
    activeLinkRef.current = activeLink;
    setIndicatorPosition({
      left: activeLink.offsetLeft,
      width: activeLink.offsetWidth,
    });
  }
}, [mainMenu]);
```

Additionally, architects can design spaces that encourage community engagement and social interaction. By incorporating public gathering areas, green spaces, and pedestrian-friendly infrastructure, they create opportunities for residents to connect, fostering a sense of community.

In conclusion, sustainable communities are not merely a product of chance; they are a result of thoughtful and intentional architectural design. Architects have the power to shape our built environment in a way that promotes sustainability, energy efficiency, and community well-being. By embracing sustainable principles and incorporating them into their designs, architects contribute significantly to the creation of sustainable communities.

# Markdown syntax guide

## Headers

# This is a Heading h1
## This is a Heading h2 
###### This is a Heading h6

## Emphasis

*This text will be italic*  
_This will also be italic_

**This text will be bold**  
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
* Item 2a
* Item 2b

### Ordered

1. Item 1
1. Item 2
1. Item 3
  1. Item 3a
  1. Item 3b

## Images

![This is an alt text.](/images/blog/05.jpg "This is a sample image.")

## Links

You may be visiting [a Next.JS theme](https://themeforest.net/user/platol).

## Blockquotes

> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.

## Tables

| Left columns  | Right columns |
| ------------- | -------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |

## Blocks of code

```javascript
let message = 'Hello world';
alert(message);
```

## Inline code

This web site is using `markedjs/marked`.
