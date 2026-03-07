export type Question = {
  id: number;
  category: string;
  difficulty: 1 | 2 | 3;
  question: string;
};

export const QUESTIONS: Question[] = [
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

export const CATEGORIES = [...new Set(QUESTIONS.map((q) => q.category))];

export const DIFF_LABELS: Record<number, string> = { 1: "기초", 2: "중급", 3: "심화" };

export const CAT_COLORS: Record<string, string> = {
  "Java/JVM": "#f97316",
  Spring: "#22c55e",
  Database: "#3b82f6",
  Network: "#a855f7",
  "OS/Infra": "#ec4899",
  "자료구조/알고리즘": "#06b6d4",
  "설계/아키텍처": "#eab308",
  "디자인 패턴": "#8b5cf6",
  보안: "#f43f5e",
  Web: "#14b8a6",
  JavaScript: "#facc15",
  "Node.js": "#22c55e",
  Python: "#3b82f6",
  "Django/FastAPI": "#0ea5e9",
};
