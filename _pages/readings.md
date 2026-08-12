---
layout: default
permalink: /readings/
title: readings
nav: true
nav_order: 3
readings_name: readings
readings_description: working through books and long reviews, one chapter at a time — study notes written to be reread
---

{% comment %}
  Study notes from books and long reviews, grouped by thread (an entry's
  `categories`) rather than listed by date, because a thread follows its
  sources front-to-back.

  Thread names, blurbs and order live in `_data/reading_threads.yml`. Empty
  threads are skipped. Entries whose category is not a declared thread fall
  through to "Other notes" so nothing is silently dropped.
{% endcomment %}

<style>
  .thread {
    margin-bottom: 3rem;
  }
  .thread-head {
    border-bottom: 1px solid var(--global-divider-color);
    padding-bottom: 0.4rem;
    margin-bottom: 0.35rem;
  }
  .thread-head h2 {
    margin: 0;
    font-size: 1.35rem;
    color: var(--global-theme-color);
  }
  .thread-count {
    font-size: 0.8rem;
    color: var(--global-text-color-light);
    white-space: nowrap;
  }
  .thread-blurb {
    color: var(--global-text-color-light);
    font-size: 0.95rem;
    margin: 0 0 1.1rem;
  }
  ol.thread-posts {
    list-style: none;
    padding-left: 0;
    margin: 0;
    counter-reset: postnum;
  }
  ol.thread-posts > li {
    counter-increment: postnum;
    display: grid;
    grid-template-columns: 2.1rem 1fr;
    gap: 0.2rem 0.6rem;
    margin-bottom: 1.5rem;
  }
  ol.thread-posts > li::before {
    content: counter(postnum);
    grid-row: 1 / span 3;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--global-theme-color);
    opacity: 0.55;
    text-align: right;
    line-height: 1.4;
  }
  ol.thread-posts .post-title {
    font-size: 1.1rem;
  }
  ol.thread-posts p {
    margin: 0.15rem 0 0;
  }
  @media (max-width: 576px) {
    ol.thread-posts > li {
      grid-template-columns: 1.5rem 1fr;
    }
  }
</style>

<div class="post">
  <div class="header-bar">
    <h1>{{ page.readings_name }}</h1>
    <h2>{{ page.readings_description }}</h2>
  </div>

  {%- comment -%} Track which entries a thread has claimed, so leftovers can be found below. {%- endcomment -%}
  {% assign claimed = '' %}
  {% assign shown = 0 %}

  {% for thread in site.data.reading_threads %}
    {% assign thread_posts = site.readings | where_exp: "p", "p.categories contains thread.slug" | sort: 'date' %}
    {% if thread_posts and thread_posts.size > 0 %}
      {% assign shown = shown | plus: thread_posts.size %}
      <div class="thread">
        <div class="thread-head d-flex justify-content-between align-items-baseline">
          <h2 id="{{ thread.slug }}">{{ thread.name }}</h2>
          <span class="thread-count">{{ thread_posts.size }} note{% if thread_posts.size != 1 %}s{% endif %}</span>
        </div>
        {% if thread.blurb %}<p class="thread-blurb">{{ thread.blurb }}</p>{% endif %}

        <ol class="thread-posts">
          {% for post in thread_posts %}
            {% capture claim %}|{{ post.url }}|{% endcapture %}
            {% assign claimed = claimed | append: claim %}
            {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
            <li>
              <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
              {% if post.description %}<p>{{ post.description }}</p>{% endif %}
              <p class="post-meta">
                {{ read_time }} min read &nbsp;&middot;&nbsp; {{ post.date | date: '%B %Y' }}
              </p>
            </li>
          {% endfor %}
        </ol>
      </div>
    {% endif %}
  {% endfor %}

  {%- comment -%} Anything not claimed by a declared thread — never drop an entry silently. {%- endcomment -%}
  {% assign other = site.readings | sort: 'date' %}
  {% assign other_count = 0 %}
  {% for post in other %}
    {% capture claim %}|{{ post.url }}|{% endcapture %}
    {% unless claimed contains claim %}
      {% assign other_count = other_count | plus: 1 %}
    {% endunless %}
  {% endfor %}

  {% if other_count > 0 %}
    <div class="thread">
      <div class="thread-head d-flex justify-content-between align-items-baseline">
        <h2 id="other">Other notes</h2>
        <span class="thread-count">{{ other_count }} note{% if other_count != 1 %}s{% endif %}</span>
      </div>
      <p class="thread-blurb">Not yet part of a thread — give the entry a <code>categories:</code> matching a slug in <code>_data/reading_threads.yml</code> to file it.</p>

      <ol class="thread-posts">
        {% for post in other %}
          {% capture claim %}|{{ post.url }}|{% endcapture %}
          {% unless claimed contains claim %}
            {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
            <li>
              <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
              {% if post.description %}<p>{{ post.description }}</p>{% endif %}
              <p class="post-meta">{{ read_time }} min read &nbsp;&middot;&nbsp; {{ post.date | date: '%B %Y' }}</p>
            </li>
          {% endunless %}
        {% endfor %}
      </ol>
    </div>
  {% endif %}

  {% if shown == 0 and other_count == 0 %}
    <p>Nothing here yet — this section is just getting started. Study notes from the
    books and long reviews I'm working through (non-equilibrium field theory first)
    are on the way.</p>
  {% endif %}
</div>
