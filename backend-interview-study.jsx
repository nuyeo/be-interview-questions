import { useState, useEffect, useCallback, useRef } from "react";

const QUESTIONS = [
  // === Java/JVM ===
  { id: 1, category: "Java/JVM", difficulty: 1, question: "자바의 접근 제어자(public, protected, default, private)에 대해 각각 설명해주세요." },
  { id: 2, category: "Java/JVM", difficulty: 1, question: "정적(static) 키워드란 무엇인가요? static 변수와 메서드의 특징, 그리고 남용하면 안 되는 이유를 설명해주세요." },
  { id: 3, category: "Java/JVM", difficulty: 1, question: "자바의 원시타입들은 무엇이 있으며 각각 몇 바이트를 차지하나요?" },
  { id: 4, category: "Java/JVM", difficulty: 1, question: "클래스(Class)와 객체(Object)는 무엇인가요? 인스턴스와 객체의 차이는?" },
  { id: 5, category: "Java/JVM", difficulty: 1, question: "객체지향 프로그래밍(OOP)이란 무엇인가요? 핵심 특징(캡슐화, 상속, 다형성, 추상화)을 설명해주세요." },
  { id: 6, category: "Java/JVM", difficulty: 2, question: "JVM의 메모리 구조(Heap, Stack, Method Area 등)를 설명하고, 각 영역에 어떤 데이터가 저장되는지 설명해주세요." },
  { id: 7, category: "Java/JVM", difficulty: 2, question: "Java에서 String, StringBuilder, StringBuffer의 차이를 설명하고, 각각 어떤 상황에서 사용하는지 말해주세요." },
  { id: 8, category: "Java/JVM", difficulty: 2, question: "Java의 Checked Exception과 Unchecked Exception의 차이를 설명해주세요. 스프링 트랜잭션에서 rollback 대상은 무엇인가요?" },
  { id: 9, category: "Java/JVM", difficulty: 2, question: "Java의 HashMap 내부 동작 원리를 설명해주세요. 해시 충돌은 어떻게 처리되나요?" },
  { id: 10, category: "Java/JVM", difficulty: 2, question: "Java 8의 Stream API와 Optional에 대해 설명해주세요." },
  { id: 11, category: "Java/JVM", difficulty: 2, question: "오버라이딩(Overriding)과 오버로딩(Overloading)이 무엇이며 어떤 차이가 있나요? @Override 애노테이션을 써야 하는 이유는?" },
  { id: 12, category: "Java/JVM", difficulty: 2, question: "인터페이스와 추상클래스의 차이점에 대해 설명해주세요. 각각 언제 사용하는 것이 적절한가요?" },
  { id: 13, category: "Java/JVM", difficulty: 2, question: "원시타입(Primitive Type)과 참조타입(Reference Type)의 차이에 대해 설명해주세요." },
  { id: 14, category: "Java/JVM", difficulty: 2, question: "동일성(identity, ==)과 동등성(equality, equals())의 차이를 설명해주세요. equals()와 hashCode()를 함께 오버라이드해야 하는 이유는?" },
  { id: 15, category: "Java/JVM", difficulty: 2, question: "try-with-resources에 대해 설명해주세요. 기존 try-finally 방식과 비교했을 때 장점은 무엇인가요?" },
  { id: 16, category: "Java/JVM", difficulty: 2, question: "직렬화(Serialization)와 역직렬화(Deserialization)에 대해 설명해주세요. Java에서 Serializable 인터페이스의 역할은?" },
  { id: 17, category: "Java/JVM", difficulty: 2, question: "JCF(Java Collection Framework) 자료구조의 초기 용량을 지정하면 좋은 점이 무엇인가요?" },
  { id: 18, category: "Java/JVM", difficulty: 2, question: "애노테이션(Annotation)에 대해 설명해주세요. 메타 애노테이션(@Retention, @Target 등)의 역할은?" },
  { id: 19, category: "Java/JVM", difficulty: 2, question: "제네릭(Generic)이란 무엇이고, 왜 사용하나요? 타입 소거(Type Erasure)에 대해서도 설명해주세요." },
  { id: 20, category: "Java/JVM", difficulty: 2, question: "자바 프로그램이 실행되는 흐름을 .java 파일 작성부터 실행까지 설명해주세요." },
  { id: 21, category: "Java/JVM", difficulty: 2, question: "Java 컬렉션 프레임워크의 구조를 설명해주세요. List, Set, Map의 차이와 각각의 주요 구현체는?" },
  { id: 22, category: "Java/JVM", difficulty: 2, question: "강한 결합(Tight Coupling)과 느슨한 결합(Loose Coupling)이 무엇인지 설명해주세요." },
  { id: 23, category: "Java/JVM", difficulty: 2, question: "Java의 ThreadPool과 ExecutorService에 대해 설명해주세요. 스레드를 직접 생성하지 않고 풀을 사용하는 이유는?" },
  { id: 24, category: "Java/JVM", difficulty: 2, question: "Java의 리플렉션(Reflection)이란 무엇인가요? 사용 사례와 주의점을 설명해주세요." },
  { id: 25, category: "Java/JVM", difficulty: 2, question: "Java의 클래스 로더(ClassLoader)에 대해 설명해주세요. 부트스트랩, 확장, 애플리케이션 클래스 로더의 역할은?" },
  { id: 26, category: "Java/JVM", difficulty: 2, question: "Java의 함수형 인터페이스(Functional Interface)란 무엇인가요? @FunctionalInterface와 람다식의 관계를 설명해주세요." },
  { id: 27, category: "Java/JVM", difficulty: 2, question: "자바의 final 키워드를 변수, 메서드, 클래스에 사용했을 때 각각 어떤 의미인가요?" },
  { id: 28, category: "Java/JVM", difficulty: 2, question: "Java의 ConcurrentHashMap은 HashMap, Hashtable과 어떻게 다른가요? 동시성을 어떻게 보장하나요?" },
  { id: 29, category: "Java/JVM", difficulty: 3, question: "GC(Garbage Collection)의 동작 방식을 설명하고, G1 GC와 ZGC의 차이점을 말해주세요." },
  { id: 30, category: "Java/JVM", difficulty: 3, question: "Java의 synchronized 키워드와 ReentrantLock의 차이를 설명하고, 각각의 장단점을 말해주세요." },
  { id: 31, category: "Java/JVM", difficulty: 3, question: "자바에서 제네릭의 공변(Covariance), 반공변(Contravariance), 무공변(Invariance)에 대해 설명해주세요." },
  { id: 32, category: "Java/JVM", difficulty: 3, question: "Java의 volatile 키워드와 메모리 가시성(Memory Visibility)에 대해 설명해주세요. happens-before 관계란?" },

  // === Spring ===
  { id: 33, category: "Spring", difficulty: 1, question: "Spring과 Spring Boot의 차이를 설명해주세요. Spring Boot가 해결하려는 문제는?" },
  { id: 34, category: "Spring", difficulty: 2, question: "Spring의 IoC(Inversion of Control)와 DI(Dependency Injection)의 개념을 설명하고, 왜 필요한지 말해주세요." },
  { id: 35, category: "Spring", difficulty: 2, question: "Spring Bean의 라이프사이클과 스코프(Singleton, Prototype 등)에 대해 설명해주세요." },
  { id: 36, category: "Spring", difficulty: 2, question: "Spring MVC의 요청 처리 흐름을 DispatcherServlet부터 설명해주세요." },
  { id: 37, category: "Spring", difficulty: 2, question: "Spring Security의 인증(Authentication)과 인가(Authorization) 처리 흐름을 설명해주세요." },
  { id: 38, category: "Spring", difficulty: 2, question: "JPA의 영속성 컨텍스트(Persistence Context)와 엔티티 매니저(Entity Manager)에 대해 설명해주세요." },
  { id: 39, category: "Spring", difficulty: 2, question: "JPA의 지연 로딩(Lazy Loading)과 즉시 로딩(Eager Loading)의 차이를 설명하고, 각각의 장단점을 말해주세요." },
  { id: 40, category: "Spring", difficulty: 2, question: "Spring의 Filter, Interceptor, AOP의 차이를 설명해주세요. 각각 어떤 상황에서 사용하나요?" },
  { id: 41, category: "Spring", difficulty: 2, question: "JPA에서 영속성 컨텍스트의 1차 캐시, 쓰기 지연, 변경 감지(Dirty Checking)에 대해 설명해주세요." },
  { id: 42, category: "Spring", difficulty: 2, question: "@Component, @Service, @Repository, @Controller의 차이와 각각의 역할을 설명해주세요." },
  { id: 43, category: "Spring", difficulty: 2, question: "Spring에서 의존성 주입 방법(생성자, 세터, 필드 주입)의 차이와 생성자 주입을 권장하는 이유를 설명해주세요." },
  { id: 44, category: "Spring", difficulty: 3, question: "Spring AOP의 동작 원리를 설명하고, JDK Dynamic Proxy와 CGLIB Proxy의 차이를 말해주세요." },
  { id: 45, category: "Spring", difficulty: 3, question: "Spring의 @Transactional 어노테이션의 동작 원리를 설명하고, 트랜잭션 전파(Propagation) 옵션들을 설명해주세요." },
  { id: 46, category: "Spring", difficulty: 3, question: "HikariCP와 MySQL의 Connection Pool은 어떻게 다른가요? 서버가 여러 대일 때 pool size는 어떻게 설정해야 하나요?" },
  { id: 47, category: "Spring", difficulty: 3, question: "JPA의 N+1 문제란 무엇이고, 발생 원인과 해결 방법(Fetch Join, @EntityGraph, @BatchSize 등)을 설명해주세요." },
  { id: 48, category: "Spring", difficulty: 3, question: "Spring의 프록시 기반 AOP의 한계를 설명해주세요. 같은 클래스 내 메서드 호출 시 @Transactional이 동작하지 않는 이유는?" },

  // === Database ===
  { id: 49, category: "Database", difficulty: 1, question: "트랜잭션이란 무엇인가요? ACID(원자성, 일관성, 고립성, 지속성) 각각을 설명해주세요." },
  { id: 50, category: "Database", difficulty: 2, question: "인덱스(Index)란 무엇이고, B+Tree 인덱스의 구조와 동작 원리를 설명해주세요." },
  { id: 51, category: "Database", difficulty: 2, question: "정규화(Normalization)란 무엇이고, 제1~제3 정규형을 예시와 함께 설명해주세요." },
  { id: 52, category: "Database", difficulty: 2, question: "클러스터드 인덱스(Clustered Index)와 논클러스터드 인덱스(Non-Clustered Index)의 차이를 설명해주세요." },
  { id: 53, category: "Database", difficulty: 2, question: "SQL의 JOIN 종류(INNER, LEFT, RIGHT, FULL OUTER, CROSS)를 각각 설명해주세요." },
  { id: 54, category: "Database", difficulty: 2, question: "RDBMS와 NoSQL의 차이를 설명해주세요. 각각 어떤 상황에서 사용하는 것이 적절한가요?" },
  { id: 55, category: "Database", difficulty: 2, question: "Redis에 대해 설명해주세요. 싱글스레드인데 어떻게 빠른 성능을 낼 수 있나요?" },
  { id: 56, category: "Database", difficulty: 2, question: "Redis와 Memcached의 차이에 대해 설명해주세요." },
  { id: 57, category: "Database", difficulty: 2, question: "낙관적 락(Optimistic Lock)과 비관적 락(Pessimistic Lock)에 대해 설명해주세요." },
  { id: 58, category: "Database", difficulty: 2, question: "MongoDB에 대해 설명해주세요. Document DB의 특징과 RDBMS와의 차이점은?" },
  { id: 59, category: "Database", difficulty: 2, question: "커버링 인덱스(Covering Index)란 무엇이고, 어떤 상황에서 성능 향상을 기대할 수 있나요?" },
  { id: 60, category: "Database", difficulty: 2, question: "데이터베이스의 뷰(View)와 인라인 뷰(서브쿼리)의 차이를 설명해주세요." },
  { id: 61, category: "Database", difficulty: 3, question: "트랜잭션의 격리 수준(Isolation Level) 4가지를 설명하고, 각 수준에서 발생할 수 있는 문제를 말해주세요." },
  { id: 62, category: "Database", difficulty: 3, question: "MySQL의 실행 계획(EXPLAIN)을 읽는 방법을 설명하고, 주요 지표들을 말해주세요." },
  { id: 63, category: "Database", difficulty: 3, question: "데드락(Deadlock)이란 무엇이고, MySQL에서 이를 감지하고 해결하는 방법을 설명해주세요." },
  { id: 64, category: "Database", difficulty: 3, question: "Elasticsearch에 대해 설명해주세요. Inverted Index 구조와 RDBMS의 B-Tree 인덱스 구조의 차이는?" },
  { id: 65, category: "Database", difficulty: 3, question: "데이터베이스의 동시성 제어 방법을 설명해주세요. MVCC(Multi-Version Concurrency Control)란 무엇인가요?" },
  { id: 66, category: "Database", difficulty: 3, question: "데이터베이스 레플리케이션(Replication)과 샤딩(Sharding)의 차이를 설명해주세요. 각각 언제 사용하나요?" },

  // === Network ===
  { id: 67, category: "Network", difficulty: 1, question: "TCP와 UDP의 차이점에 대해 설명해주세요. 각각 어떤 서비스에 적합한가요?" },
  { id: 68, category: "Network", difficulty: 1, question: "쿠키(Cookie)와 세션(Session)의 차이를 설명하고, 각각의 장단점을 말해주세요." },
  { id: 69, category: "Network", difficulty: 1, question: "HTTP 메서드(GET, POST, PUT, DELETE, PATCH)와 각각의 역할에 대해 설명해주세요." },
  { id: 70, category: "Network", difficulty: 1, question: "HTTP 상태 코드의 주요 분류(1xx~5xx)를 설명하고, 자주 사용되는 코드(200, 201, 400, 401, 404, 500 등)를 설명해주세요." },
  { id: 71, category: "Network", difficulty: 2, question: "TCP 3-way handshake와 4-way handshake의 과정을 각각 설명해주세요." },
  { id: 72, category: "Network", difficulty: 2, question: "HTTP/1.1, HTTP/2, HTTP/3의 주요 차이점을 설명해주세요." },
  { id: 73, category: "Network", difficulty: 2, question: "HTTPS의 동작 원리를 TLS 핸드셰이크 과정을 포함하여 설명해주세요." },
  { id: 74, category: "Network", difficulty: 2, question: "REST API의 설계 원칙을 설명하고, RESTful하다는 것이 무엇을 의미하는지 말해주세요." },
  { id: 75, category: "Network", difficulty: 2, question: "웹 통신의 큰 흐름을 설명해주세요. 브라우저에 https://www.google.com을 입력하면 어떤 일이 일어나나요?" },
  { id: 76, category: "Network", difficulty: 2, question: "CORS란 무엇이며, 왜 발생하고 어떻게 해결하나요? Preflight Request에 대해서도 설명해주세요." },
  { id: 77, category: "Network", difficulty: 2, question: "OSI 7계층과 TCP/IP 4계층에 대해 설명해주세요. 왜 계층화하여 관리하나요?" },
  { id: 78, category: "Network", difficulty: 2, question: "Keep-Alive에 대해 설명해주세요. HTTP/1.0과 HTTP/1.1에서의 차이점은?" },
  { id: 79, category: "Network", difficulty: 2, question: "HTTP 메서드에서 멱등성(Idempotency)이란 무엇인가요? 멱등한 메서드와 그렇지 않은 메서드를 구분해주세요." },
  { id: 80, category: "Network", difficulty: 2, question: "WebSocket과 HTTP의 차이를 설명해주세요. WebSocket은 어떤 상황에서 사용하나요?" },
  { id: 81, category: "Network", difficulty: 2, question: "프록시(Proxy)에 대해 설명해주세요. 포워드 프록시와 리버스 프록시의 차이는?" },
  { id: 82, category: "Network", difficulty: 2, question: "CDN(Content Delivery Network)이란 무엇이고, 어떤 원리로 성능을 향상시키나요?" },
  { id: 83, category: "Network", difficulty: 2, question: "DNS(Domain Name System)의 동작 과정을 설명해주세요. DNS 캐시, 재귀적/반복적 질의란?" },
  { id: 84, category: "Network", difficulty: 3, question: "로드 밸런서의 동작 원리와 L4/L7 로드 밸런싱의 차이를 설명해주세요." },

  // === OS/Infra ===
  { id: 85, category: "OS/Infra", difficulty: 1, question: "캐시(Cache)의 개념과 캐시 교체 정책(LRU, LFU 등)을 설명해주세요." },
  { id: 86, category: "OS/Infra", difficulty: 1, question: "가상화(Virtualization)에 대해 설명해주세요. 하이퍼바이저의 역할은?" },
  { id: 87, category: "OS/Infra", difficulty: 1, question: "단일 프로세스 시스템에 대해 설명하고, 왜 멀티프로세스/멀티스레드가 필요한지 말해주세요." },
  { id: 88, category: "OS/Infra", difficulty: 2, question: "프로세스(Process)와 스레드(Thread)의 차이를 설명하고, 멀티프로세스와 멀티스레드의 장단점을 비교해주세요." },
  { id: 89, category: "OS/Infra", difficulty: 2, question: "가상 메모리(Virtual Memory)란 무엇이고, 페이지 폴트(Page Fault) 처리 과정을 설명해주세요." },
  { id: 90, category: "OS/Infra", difficulty: 2, question: "Docker 컨테이너와 가상 머신(VM)의 차이를 설명해주세요." },
  { id: 91, category: "OS/Infra", difficulty: 2, question: "컨텍스트 스위칭(Context Switching)이란 무엇이고, 프로세스와 스레드 간 컨텍스트 스위칭의 차이를 설명해주세요." },
  { id: 92, category: "OS/Infra", difficulty: 2, question: "동기(Synchronous)와 비동기(Asynchronous), 블로킹(Blocking)과 논블로킹(Non-blocking)의 차이를 설명해주세요." },
  { id: 93, category: "OS/Infra", difficulty: 2, question: "Thread-safe하다는 것은 무엇을 의미하나요? Thread-safe하게 설계하는 방법을 설명해주세요." },
  { id: 94, category: "OS/Infra", difficulty: 2, question: "세마포어(Semaphore)와 뮤텍스(Mutex)의 차이에 대해 설명해주세요." },
  { id: 95, category: "OS/Infra", difficulty: 2, question: "캐시의 지역성(Locality)에 대해 설명해주세요. 시간 지역성과 공간 지역성이란?" },
  { id: 96, category: "OS/Infra", difficulty: 2, question: "멀티태스킹 시스템의 한계에 대해 설명해주세요." },
  { id: 97, category: "OS/Infra", difficulty: 2, question: "교착상태(Deadlock)와 기아상태(Starvation)의 차이를 설명하고, 각각의 해결 방법을 말해주세요." },
  { id: 98, category: "OS/Infra", difficulty: 2, question: "CPU 스케줄링 알고리즘(FCFS, SJF, Round Robin, Priority 등)에 대해 설명해주세요." },
  { id: 99, category: "OS/Infra", difficulty: 2, question: "페이징(Paging)과 세그멘테이션(Segmentation)의 차이를 설명해주세요." },
  { id: 100, category: "OS/Infra", difficulty: 2, question: "인터럽트(Interrupt)란 무엇인가요? 하드웨어 인터럽트와 소프트웨어 인터럽트의 차이를 설명해주세요." },
  { id: 101, category: "OS/Infra", difficulty: 2, question: "사용자 모드(User Mode)와 커널 모드(Kernel Mode)의 차이를 설명해주세요. 시스템 콜이란?" },
  { id: 102, category: "OS/Infra", difficulty: 3, question: "교착상태(Deadlock)의 4가지 필요조건과 해결 방법을 설명해주세요." },

  // === 자료구조/알고리즘 ===
  { id: 103, category: "자료구조/알고리즘", difficulty: 1, question: "Array와 LinkedList의 차이를 시간복잡도 관점에서 설명해주세요." },
  { id: 104, category: "자료구조/알고리즘", difficulty: 1, question: "스택(Stack)과 큐(Queue)의 차이를 설명하고, 각각의 활용 사례를 말해주세요." },
  { id: 105, category: "자료구조/알고리즘", difficulty: 1, question: "List와 Set의 차이에 대해 설명해주세요." },
  { id: 106, category: "자료구조/알고리즘", difficulty: 1, question: "시간 복잡도와 공간 복잡도에 대해 설명해주세요. Big-O 표기법이란?" },
  { id: 107, category: "자료구조/알고리즘", difficulty: 2, question: "해시 테이블(Hash Table)의 동작 원리와 충돌 해결 방법(Chaining, Open Addressing)을 설명해주세요." },
  { id: 108, category: "자료구조/알고리즘", difficulty: 2, question: "이진 탐색 트리(BST)와 균형 이진 탐색 트리(AVL, Red-Black Tree)의 차이를 설명해주세요." },
  { id: 109, category: "자료구조/알고리즘", difficulty: 2, question: "힙(Heap)과 우선순위 큐(Priority Queue)에 대해 설명해주세요." },
  { id: 110, category: "자료구조/알고리즘", difficulty: 2, question: "DFS(깊이 우선 탐색)와 BFS(너비 우선 탐색)에 대해 설명해주세요. 각각 어떤 상황에서 사용하나요?" },
  { id: 111, category: "자료구조/알고리즘", difficulty: 2, question: "피보나치 수열을 코드로 구현하는 방법을 설명해주세요. 재귀와 DP 방식의 차이와 시간복잡도는?" },
  { id: 112, category: "자료구조/알고리즘", difficulty: 2, question: "BST의 최악의 경우를 예시와 시간복잡도로 설명해주세요. Self-Balanced Tree를 사용하는 이유는?" },

  // === 설계/아키텍처 ===
  { id: 113, category: "설계/아키텍처", difficulty: 2, question: "MSA(Microservice Architecture)와 모놀리식(Monolithic) 아키텍처의 차이를 설명하고 각각의 장단점을 말해주세요." },
  { id: 114, category: "설계/아키텍처", difficulty: 2, question: "메시지 큐(Message Queue)를 사용하는 이유와 Kafka, RabbitMQ의 차이를 설명해주세요." },
  { id: 115, category: "설계/아키텍처", difficulty: 2, question: "SOLID 원칙을 각각 설명하고, 실제 코드에서 어떻게 적용하는지 예시를 들어주세요." },
  { id: 116, category: "설계/아키텍처", difficulty: 3, question: "CAP 정리(CAP Theorem)를 설명하고, Eventual Consistency란 무엇인지 말해주세요." },
  { id: 117, category: "설계/아키텍처", difficulty: 3, question: "동기 방식으로 외부 서비스를 호출할 때 장애가 발생하면 어떻게 대응하나요? 서킷 브레이커, 벌크헤드 패턴에 대해 설명해주세요." },

  // === 디자인 패턴 ===
  { id: 118, category: "디자인 패턴", difficulty: 2, question: "싱글톤 패턴(Singleton Pattern)에 대해 설명해주세요. 멀티스레드 환경에서 안전하게 구현하는 방법은?" },
  { id: 119, category: "디자인 패턴", difficulty: 2, question: "팩토리 메서드 패턴(Factory Method)과 추상 팩토리 패턴(Abstract Factory)의 차이를 설명해주세요." },
  { id: 120, category: "디자인 패턴", difficulty: 2, question: "전략 패턴(Strategy Pattern)에 대해 설명해주세요. OCP 원칙과 어떤 관계가 있나요?" },
  { id: 121, category: "디자인 패턴", difficulty: 2, question: "옵저버 패턴(Observer Pattern)에 대해 설명해주세요. Java에서의 활용 사례는?" },
  { id: 122, category: "디자인 패턴", difficulty: 2, question: "프록시 패턴(Proxy Pattern)에 대해 설명해주세요. Spring AOP와의 관계는?" },
  { id: 123, category: "디자인 패턴", difficulty: 2, question: "템플릿 메서드 패턴(Template Method Pattern)에 대해 설명해주세요." },
  { id: 124, category: "디자인 패턴", difficulty: 2, question: "빌더 패턴(Builder Pattern)에 대해 설명해주세요. Lombok의 @Builder와의 관계는?" },
  { id: 125, category: "디자인 패턴", difficulty: 2, question: "MVC 패턴이란 무엇인가요? Spring MVC에서 각 역할(Model, View, Controller)은 어떻게 분리되나요?" },

  // === 보안 ===
  { id: 126, category: "보안", difficulty: 1, question: "SQL Injection에 대해 설명하고, 방어 방법을 말해주세요." },
  { id: 127, category: "보안", difficulty: 2, question: "대칭키 암호화와 비대칭키(공개키) 암호화의 차이를 설명해주세요. 왜 HTTPS에서 둘을 복합적으로 사용하나요?" },
  { id: 128, category: "보안", difficulty: 2, question: "JWT(JSON Web Token)에 대해 설명해주세요. 세션 기반 인증과 비교했을 때 장단점은?" },
  { id: 129, category: "보안", difficulty: 2, question: "OAuth에 대해 설명해주세요. 제3자 인증 방식이 필요한 이유는?" },
  { id: 130, category: "보안", difficulty: 2, question: "XSS(Cross-Site Scripting)에 대해 설명하고, 방어 방법을 말해주세요." },
  { id: 131, category: "보안", difficulty: 2, question: "CSRF(Cross-Site Request Forgery)에 대해 설명하고, 방어 방법을 말해주세요." },
  { id: 132, category: "보안", difficulty: 2, question: "단방향 암호화(해시)에 대해 설명해주세요. bcrypt를 사용하는 이유는?" },

  // === Web ===
  { id: 133, category: "Web", difficulty: 1, question: "SOP(Same-Origin Policy)란 무엇인가요? 왜 브라우저에서 이를 적용하나요?" },
  { id: 134, category: "Web", difficulty: 2, question: "브라우저의 렌더링 과정(Critical Rendering Path)을 설명해주세요. DOM → CSSOM → Render Tree → Layout → Paint" },
  { id: 135, category: "Web", difficulty: 2, question: "HTTP 캐싱 전략을 설명해주세요. Cache-Control, ETag, Last-Modified의 역할과 차이는?" },
  { id: 136, category: "Web", difficulty: 2, question: "SSR(Server Side Rendering)과 CSR(Client Side Rendering)의 차이를 설명해주세요. 각각의 장단점은?" },
  { id: 137, category: "Web", difficulty: 2, question: "API Gateway의 역할과 필요성을 설명해주세요." },

  // === JavaScript ===
  { id: 138, category: "JavaScript", difficulty: 1, question: "JavaScript의 데이터 타입을 설명해주세요. 원시 타입과 참조 타입의 차이는? ==(동등)과 ===(일치)의 차이는?" },
  { id: 139, category: "JavaScript", difficulty: 2, question: "JavaScript의 이벤트 루프(Event Loop)에 대해 설명해주세요. Call Stack, Task Queue, Microtask Queue의 관계는?" },
  { id: 140, category: "JavaScript", difficulty: 2, question: "클로저(Closure)란 무엇인가요? 활용 사례와 주의점을 설명해주세요." },
  { id: 141, category: "JavaScript", difficulty: 2, question: "JavaScript의 this 바인딩 규칙을 설명해주세요. 화살표 함수에서의 this는 어떻게 다른가요?" },
  { id: 142, category: "JavaScript", difficulty: 2, question: "Promise와 async/await에 대해 설명해주세요. 콜백 지옥(Callback Hell)을 어떻게 해결하나요?" },
  { id: 143, category: "JavaScript", difficulty: 2, question: "호이스팅(Hoisting)이란 무엇인가요? var, let, const의 차이와 TDZ(Temporal Dead Zone)를 설명해주세요." },
  { id: 144, category: "JavaScript", difficulty: 2, question: "프로토타입(Prototype)과 프로토타입 체인에 대해 설명해주세요. JavaScript의 상속은 어떻게 동작하나요?" },
  { id: 145, category: "JavaScript", difficulty: 2, question: "JavaScript의 스코프(Scope)에 대해 설명해주세요. 함수 스코프와 블록 스코프의 차이는?" },
  { id: 146, category: "JavaScript", difficulty: 2, question: "JavaScript의 실행 컨텍스트(Execution Context)란 무엇인가요?" },
  { id: 147, category: "JavaScript", difficulty: 2, question: "JavaScript에서 깊은 복사(Deep Copy)와 얕은 복사(Shallow Copy)의 차이를 설명해주세요." },

  // === Node.js ===
  { id: 148, category: "Node.js", difficulty: 1, question: "npm과 package.json의 역할을 설명해주세요. dependencies와 devDependencies의 차이는?" },
  { id: 149, category: "Node.js", difficulty: 2, question: "Node.js의 싱글 스레드 + 이벤트 루프 기반 아키텍처를 설명해주세요. 싱글 스레드인데 어떻게 동시 요청을 처리하나요?" },
  { id: 150, category: "Node.js", difficulty: 2, question: "Node.js의 논블로킹 I/O에 대해 설명해주세요. libuv의 역할은?" },

  // === Python ===
  { id: 151, category: "Python", difficulty: 1, question: "Python의 리스트(List)와 튜플(Tuple)의 차이를 설명해주세요. 딕셔너리(Dict)의 내부 구조는?" },
  { id: 152, category: "Python", difficulty: 1, question: "Python의 데코레이터(Decorator)란 무엇인가요? 사용 사례를 들어 설명해주세요." },
  { id: 153, category: "Python", difficulty: 2, question: "Python의 GIL(Global Interpreter Lock)이란 무엇인가요? 멀티스레딩에 어떤 영향을 주나요?" },
  { id: 154, category: "Python", difficulty: 2, question: "Python의 제너레이터(Generator)와 이터레이터(Iterator)에 대해 설명해주세요. yield 키워드의 역할은?" },

  // === Django/FastAPI ===
  { id: 155, category: "Django/FastAPI", difficulty: 1, question: "FastAPI가 Flask/Django 대비 빠른 이유를 설명해주세요. 비동기 처리와의 관계는?" },
  { id: 156, category: "Django/FastAPI", difficulty: 2, question: "Django의 ORM과 SQLAlchemy의 차이를 설명해주세요. 각각의 장단점은?" },
  { id: 157, category: "Django/FastAPI", difficulty: 2, question: "WSGI와 ASGI의 차이를 설명해주세요. Django와 FastAPI는 각각 어떤 방식을 사용하나요?" },
  { id: 158, category: "Django/FastAPI", difficulty: 2, question: "Django의 미들웨어(Middleware)란 무엇인가요? 요청/응답 흐름에서 어떤 역할을 하나요?" },
];

const CATEGORIES = [...new Set(QUESTIONS.map(q => q.category))];

const DIFF_LABELS = { 1: "기초", 2: "중급", 3: "심화" };
const DIFF_COLORS = {
  1: { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.3)" },
  2: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  3: { bg: "rgba(251,113,133,0.12)", text: "#fb7185", border: "rgba(251,113,133,0.3)" },
};

const CAT_COLORS = {
  "Java/JVM": "#f97316",
  "Spring": "#22c55e",
  "Database": "#3b82f6",
  "Network": "#a855f7",
  "OS/Infra": "#ec4899",
  "자료구조/알고리즘": "#06b6d4",
  "설계/아키텍처": "#eab308",
  "보안": "#f43f5e",
  "디자인 패턴": "#8b5cf6",
  "Web": "#14b8a6",
  "JavaScript": "#facc15",
  "Node.js": "#22c55e",
  "Python": "#3b82f6",
  "Django/FastAPI": "#0ea5e9",
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

// Storage helpers
async function loadData(key, fallback) {
  try {
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : fallback;
  } catch {
    return fallback;
  }
}

async function saveData(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

export default function App() {
  const [view, setView] = useState("home");
  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState(null);
  const [todayCount, setTodayCount] = useState(0);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [completed, setCompleted] = useState(new Set());
  const [currentQ, setCurrentQ] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [studyHistory, setStudyHistory] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const textareaRef = useRef(null);

  // Load from storage
  useEffect(() => {
    (async () => {
      const s = await loadData("study-streak", 0);
      const ld = await loadData("study-last-date", null);
      const tc = await loadData("study-today-count", { date: getToday(), count: 0 });
      const bk = await loadData("study-bookmarks", []);
      const cp = await loadData("study-completed", []);
      const hist = await loadData("study-history", []);

      setStreak(s);
      setLastStudyDate(ld);
      if (tc.date === getToday()) {
        setTodayCount(tc.count);
      } else {
        setTodayCount(0);
      }
      setBookmarks(new Set(bk));
      setCompleted(new Set(cp));
      setStudyHistory(hist);

      // Check streak
      const today = getToday();
      if (ld && ld !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        if (ld !== yesterdayStr) {
          setStreak(0);
          await saveData("study-streak", 0);
        }
      }

      setLoaded(true);
    })();
  }, []);

  const pickRandomQuestion = useCallback((catFilter = "all", diffFilter = "all", forceReview = false) => {
    let pool = forceReview
      ? QUESTIONS.filter(q => bookmarks.has(q.id))
      : QUESTIONS;
    if (catFilter !== "all") pool = pool.filter(q => q.category === catFilter);
    if (diffFilter !== "all") pool = pool.filter(q => q.difficulty === Number(diffFilter));
    if (pool.length === 0) return null;
    // Prefer unseen questions
    const unseen = pool.filter(q => !completed.has(q.id));
    const finalPool = unseen.length > 0 ? unseen : pool;
    return finalPool[Math.floor(Math.random() * finalPool.length)];
  }, [bookmarks, completed]);

  const startStudy = (q, isReview = false) => {
    setCurrentQ(q);
    setAnswer("");
    setFeedback(null);
    setShowAnswer(false);
    setReviewMode(isReview);
    setView("study");
  };

  const markStudied = async () => {
    if (!currentQ) return;
    const today = getToday();
    const newCompleted = new Set(completed);
    newCompleted.add(currentQ.id);
    setCompleted(newCompleted);
    await saveData("study-completed", [...newCompleted]);

    let newStreak = streak;
    if (lastStudyDate !== today) {
      newStreak = streak + 1;
      setStreak(newStreak);
      setLastStudyDate(today);
      await saveData("study-streak", newStreak);
      await saveData("study-last-date", today);
    }

    const newCount = (lastStudyDate === today ? todayCount : 0) + 1;
    setTodayCount(newCount);
    await saveData("study-today-count", { date: today, count: newCount });

    const newHist = [...studyHistory, { id: currentQ.id, date: today }].slice(-100);
    setStudyHistory(newHist);
    await saveData("study-history", newHist);
  };

  const toggleBookmark = async (qId) => {
    const newBk = new Set(bookmarks);
    if (newBk.has(qId)) newBk.delete(qId);
    else newBk.add(qId);
    setBookmarks(newBk);
    await saveData("study-bookmarks", [...newBk]);
  };

  const requestFeedback = async () => {
    if (!answer.trim() || !currentQ) return;
    setLoadingFeedback(true);
    setFeedback(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `당신은 백엔드 개발 기술 면접관입니다. 다음 질문에 대한 답변을 평가해주세요.

질문: ${currentQ.question}

지원자의 답변:
${answer}

다음 형식으로 간결하게 평가해주세요 (전체 400자 이내):
1. 점수: X/10
2. 좋은 점: (1~2문장)
3. 보완할 점: (1~2문장)
4. 모범 답변 핵심 키워드: (쉼표로 구분하여 나열)`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("\n") || "피드백을 받지 못했습니다.";
      setFeedback(text);
    } catch (e) {
      setFeedback("API 호출에 실패했습니다. 네트워크를 확인해주세요.");
    }
    setLoadingFeedback(false);
  };

  const totalQ = QUESTIONS.length;
  const completedCount = completed.size;
  const bookmarkCount = bookmarks.size;
  const progress = Math.round((completedCount / totalQ) * 100);

  if (!loaded) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingPulse}>Loading...</div>
      </div>
    );
  }

  // ====== HOME VIEW ======
  if (view === "home") {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>CS 면접 마스터</h1>
              <p style={styles.subtitle}>매일 한 문제, 백엔드 면접 준비</p>
            </div>
          </div>

          {/* Streak & Stats */}
          <div style={styles.statsRow}>
            <div style={styles.streakCard}>
              <div style={styles.streakFire}>🔥</div>
              <div style={styles.streakNum}>{streak}</div>
              <div style={styles.streakLabel}>일 연속</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{todayCount}</div>
              <div style={styles.statLabel}>오늘 학습</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{completedCount}/{totalQ}</div>
              <div style={styles.statLabel}>완료</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={styles.progressText}>{progress}% 달성</span>
          </div>

          {/* Main Action */}
          <button
            style={styles.mainBtn}
            onClick={() => {
              const q = pickRandomQuestion();
              if (q) startStudy(q);
            }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(99,102,241,0.4)"; }}
            onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}
          >
            ⚡ 오늘의 랜덤 문제 풀기
          </button>

          {/* Bookmark Review */}
          {bookmarkCount > 0 && (
            <button
              style={styles.reviewBtn}
              onClick={() => {
                const q = pickRandomQuestion("all", "all", true);
                if (q) startStudy(q, true);
              }}
              onMouseEnter={e => { e.target.style.background = "rgba(251,191,36,0.15)"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(251,191,36,0.08)"; }}
            >
              🔖 북마크 복습하기 ({bookmarkCount}문제)
            </button>
          )}

          {/* Category Browse */}
          <div style={styles.sectionTitle}>카테고리별 학습</div>
          <div style={styles.catGrid}>
            {CATEGORIES.map(cat => {
              const catQs = QUESTIONS.filter(q => q.category === cat);
              const catDone = catQs.filter(q => completed.has(q.id)).length;
              const pct = Math.round((catDone / catQs.length) * 100);
              return (
                <button
                  key={cat}
                  style={{
                    ...styles.catCard,
                    borderColor: CAT_COLORS[cat] + "44",
                  }}
                  onClick={() => {
                    setFilterCat(cat);
                    setView("browse");
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = CAT_COLORS[cat]; e.target.style.background = CAT_COLORS[cat] + "0d"; }}
                  onMouseLeave={e => { e.target.style.borderColor = CAT_COLORS[cat] + "44"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <span style={{ ...styles.catDot, background: CAT_COLORS[cat] }} />
                  <span style={styles.catName}>{cat}</span>
                  <span style={styles.catCount}>{catDone}/{catQs.length}</span>
                  <div style={styles.catProgress}>
                    <div style={{ ...styles.catProgressFill, width: `${pct}%`, background: CAT_COLORS[cat] }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Access: Browse All */}
          <button
            style={styles.browseAllBtn}
            onClick={() => { setFilterCat("all"); setView("browse"); }}
          >
            전체 질문 보기 →
          </button>
        </div>
      </div>
    );
  }

  // ====== BROWSE VIEW ======
  if (view === "browse") {
    let filtered = QUESTIONS;
    if (filterCat !== "all") filtered = filtered.filter(q => q.category === filterCat);
    if (filterDiff !== "all") filtered = filtered.filter(q => q.difficulty === Number(filterDiff));

    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <button style={styles.backBtn} onClick={() => setView("home")}>← 홈으로</button>

          <h2 style={styles.browseTitle}>
            {filterCat === "all" ? "전체 질문" : filterCat}
            <span style={styles.browseCount}>{filtered.length}문제</span>
          </h2>

          {/* Filters */}
          <div style={styles.filterRow}>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">전체 카테고리</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterDiff}
              onChange={e => setFilterDiff(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">전체 난이도</option>
              <option value="1">기초</option>
              <option value="2">중급</option>
              <option value="3">심화</option>
            </select>
          </div>

          {/* Question List */}
          <div style={styles.qList}>
            {filtered.map(q => {
              const dc = DIFF_COLORS[q.difficulty];
              const isDone = completed.has(q.id);
              const isBk = bookmarks.has(q.id);
              return (
                <div key={q.id} style={{ ...styles.qItem, opacity: isDone ? 0.65 : 1 }}>
                  <div style={styles.qItemHeader}>
                    <span style={{ ...styles.diffBadge, background: dc.bg, color: dc.text, borderColor: dc.border }}>
                      {DIFF_LABELS[q.difficulty]}
                    </span>
                    <span style={{ ...styles.catBadge, color: CAT_COLORS[q.category] }}>
                      {q.category}
                    </span>
                    {isDone && <span style={styles.doneBadge}>✓ 완료</span>}
                    <button
                      style={{ ...styles.bkBtn, color: isBk ? "#fbbf24" : "#555" }}
                      onClick={e => { e.stopPropagation(); toggleBookmark(q.id); }}
                    >
                      {isBk ? "★" : "☆"}
                    </button>
                  </div>
                  <p style={styles.qText}>{q.question}</p>
                  <button
                    style={styles.studyBtn}
                    onClick={() => startStudy(q)}
                    onMouseEnter={e => { e.target.style.background = "rgba(99,102,241,0.15)"; }}
                    onMouseLeave={e => { e.target.style.background = "rgba(99,102,241,0.08)"; }}
                  >
                    학습하기
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ====== STUDY VIEW ======
  if (view === "study" && currentQ) {
    const dc = DIFF_COLORS[currentQ.difficulty];
    const isBk = bookmarks.has(currentQ.id);

    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <button style={styles.backBtn} onClick={() => setView("home")}>← 홈으로</button>

          {reviewMode && (
            <div style={styles.reviewBanner}>🔖 북마크 복습 모드</div>
          )}

          {/* Question Card */}
          <div style={styles.questionCard}>
            <div style={styles.qCardHeader}>
              <span style={{ ...styles.diffBadge, background: dc.bg, color: dc.text, borderColor: dc.border }}>
                {DIFF_LABELS[currentQ.difficulty]}
              </span>
              <span style={{ ...styles.catBadge, color: CAT_COLORS[currentQ.category] }}>
                {currentQ.category}
              </span>
              <button
                style={{ ...styles.bkBtn, color: isBk ? "#fbbf24" : "#666", fontSize: 22 }}
                onClick={() => toggleBookmark(currentQ.id)}
              >
                {isBk ? "★" : "☆"}
              </button>
            </div>
            <h3 style={styles.questionText}>{currentQ.question}</h3>
          </div>

          {/* Answer Area */}
          <div style={styles.answerSection}>
            <label style={styles.answerLabel}>나의 답변</label>
            <textarea
              ref={textareaRef}
              style={styles.textarea}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="면접처럼 답변을 작성해보세요..."
              rows={6}
            />
            <div style={styles.answerActions}>
              <button
                style={{
                  ...styles.feedbackBtn,
                  opacity: answer.trim() ? 1 : 0.4,
                  cursor: answer.trim() ? "pointer" : "default",
                }}
                disabled={!answer.trim() || loadingFeedback}
                onClick={requestFeedback}
              >
                {loadingFeedback ? "⏳ AI 분석 중..." : "🤖 AI 피드백 받기"}
              </button>
              <button
                style={styles.skipBtn}
                onClick={async () => {
                  await markStudied();
                  const q = reviewMode
                    ? pickRandomQuestion("all", "all", true)
                    : pickRandomQuestion();
                  if (q) startStudy(q, reviewMode);
                  else setView("home");
                }}
              >
                다음 문제 →
              </button>
            </div>
          </div>

          {/* AI Feedback */}
          {feedback && (
            <div style={styles.feedbackCard}>
              <div style={styles.feedbackHeader}>🤖 AI 피드백</div>
              <pre style={styles.feedbackText}>{feedback}</pre>
            </div>
          )}

          {/* Mark as studied */}
          {!completed.has(currentQ.id) && (
            <button
              style={styles.completeBtn}
              onClick={async () => {
                await markStudied();
                setView("home");
              }}
            >
              ✓ 학습 완료
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ====== STYLES ======
const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#e4e4e7",
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  inner: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "24px 20px 60px",
  },
  loadingContainer: {
    minHeight: "100vh",
    background: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
  },
  loadingPulse: {
    fontSize: 18,
    animation: "pulse 1.5s infinite",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    background: "linear-gradient(135deg, #818cf8, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: -0.5,
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#71717a",
    fontWeight: 400,
  },

  // Stats
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  streakCard: {
    flex: 1,
    background: "linear-gradient(135deg, rgba(251,146,60,0.12), rgba(251,191,36,0.08))",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: 16,
    padding: "16px 12px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  streakFire: {
    fontSize: 28,
    marginBottom: 2,
  },
  streakNum: {
    fontSize: 32,
    fontWeight: 800,
    color: "#fbbf24",
    lineHeight: 1,
  },
  streakLabel: {
    fontSize: 12,
    color: "#a1a1aa",
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "16px 12px",
    textAlign: "center",
  },
  statNum: {
    fontSize: 24,
    fontWeight: 700,
    color: "#e4e4e7",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 4,
  },

  // Progress
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  progressBar: {
    flex: 1,
    height: 8,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #818cf8, #c084fc)",
    borderRadius: 4,
    transition: "width 0.5s ease",
  },
  progressText: {
    fontSize: 13,
    color: "#a1a1aa",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  // Main Action Button
  mainBtn: {
    width: "100%",
    padding: "18px 24px",
    fontSize: 17,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  reviewBtn: {
    width: "100%",
    padding: "14px 24px",
    fontSize: 15,
    fontWeight: 600,
    color: "#fbbf24",
    background: "rgba(251,191,36,0.08)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: 32,
  },

  // Category Grid
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#a1a1aa",
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 20,
  },
  catCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    padding: "12px 12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
  },
  catName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e4e4e7",
  },
  catCount: {
    fontSize: 12,
    color: "#71717a",
  },
  catProgress: {
    width: "100%",
    height: 3,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 2,
  },
  catProgressFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.4s ease",
  },

  browseAllBtn: {
    display: "block",
    width: "100%",
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    color: "#818cf8",
    background: "transparent",
    border: "1px solid rgba(129,140,248,0.2)",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "center",
  },

  // Browse view
  backBtn: {
    background: "none",
    border: "none",
    color: "#818cf8",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: "4px 0",
    marginBottom: 16,
  },
  browseTitle: {
    fontSize: 22,
    fontWeight: 800,
    margin: "0 0 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  browseCount: {
    fontSize: 14,
    fontWeight: 500,
    color: "#71717a",
  },
  filterRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  filterSelect: {
    flex: 1,
    padding: "10px 14px",
    fontSize: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#e4e4e7",
    outline: "none",
    cursor: "pointer",
    appearance: "auto",
  },
  qList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  qItem: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "16px 18px",
    transition: "opacity 0.2s",
  },
  qItemHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  diffBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 6,
    border: "1px solid",
    letterSpacing: 0.5,
  },
  catBadge: {
    fontSize: 12,
    fontWeight: 600,
  },
  doneBadge: {
    fontSize: 11,
    color: "#34d399",
    fontWeight: 600,
  },
  bkBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    padding: "2px 4px",
    marginLeft: "auto",
    lineHeight: 1,
  },
  qText: {
    fontSize: 14,
    lineHeight: 1.65,
    color: "#d4d4d8",
    margin: "0 0 12px",
  },
  studyBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: "#818cf8",
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  // Study view
  reviewBanner: {
    background: "rgba(251,191,36,0.1)",
    color: "#fbbf24",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 16,
    textAlign: "center",
  },
  questionCard: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 18,
    padding: "24px",
    marginBottom: 24,
  },
  qCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.7,
    color: "#f4f4f5",
    margin: 0,
  },

  // Answer
  answerSection: {
    marginBottom: 20,
  },
  answerLabel: {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: "#a1a1aa",
    marginBottom: 10,
  },
  textarea: {
    width: "100%",
    padding: "16px",
    fontSize: 15,
    lineHeight: 1.7,
    color: "#e4e4e7",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    minHeight: 140,
  },
  answerActions: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  },
  feedbackBtn: {
    flex: 1,
    padding: "14px",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  skipBtn: {
    padding: "14px 20px",
    fontSize: 14,
    fontWeight: 600,
    color: "#a1a1aa",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // Feedback
  feedbackCard: {
    background: "rgba(52,211,153,0.06)",
    border: "1px solid rgba(52,211,153,0.2)",
    borderRadius: 16,
    padding: "20px",
    marginBottom: 20,
  },
  feedbackHeader: {
    fontSize: 15,
    fontWeight: 700,
    color: "#34d399",
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 1.75,
    color: "#d4d4d8",
    margin: 0,
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
  },

  // Complete Button
  completeBtn: {
    width: "100%",
    padding: "16px",
    fontSize: 16,
    fontWeight: 700,
    color: "#34d399",
    background: "rgba(52,211,153,0.08)",
    border: "1px solid rgba(52,211,153,0.25)",
    borderRadius: 14,
    cursor: "pointer",
  },
};
