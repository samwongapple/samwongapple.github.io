---
layout: default
permalink: /programming/
title: programming
nav: true
nav_order: 2
programming_name: programming
programming_description: learning notes on scientific-computing packages — ITensor, DMRJulia, QuantumControl.jl, and friends
---

<div class="post">

  <div class="header-bar">
    <h1>{{ page.programming_name }}</h1>
    <h2>{{ page.programming_description }}</h2>
  </div>

{% assign entries = site.programming | sort: "date" | reverse %}

{% if entries.size > 0 %}

  <ul class="post-list">

    {% for entry in entries %}

    {% assign read_time = entry.content | number_of_words | divided_by: 180 | plus: 1 %}
    {% assign year = entry.date | date: "%Y" %}
    {% assign tags = entry.tags | join: "" %}

    <li>
      <h3>
        <a class="post-title" href="{{ entry.url | relative_url }}">{{ entry.title }}</a>
      </h3>
      <p>{{ entry.description }}</p>
      <p class="post-meta">
        {{ read_time }} min read &nbsp; &middot; &nbsp;
        {{ entry.date | date: '%B %d, %Y' }}
      </p>
      {% if tags != "" %}
        <p class="post-tags">
          {% for tag in entry.tags %}
            <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}
            {% unless forloop.last %}&nbsp;{% endunless %}
          {% endfor %}
        </p>
      {% endif %}
    </li>

    {% endfor %}

  </ul>

{% else %}

  <p>Nothing here yet — this section is just getting started. Notes on working through
  packages like <strong>ITensor</strong>, <strong>DMRJulia</strong>, and
  <strong>QuantumControl.jl</strong> are on the way.</p>

{% endif %}

</div>
